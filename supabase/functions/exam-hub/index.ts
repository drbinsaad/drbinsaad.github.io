// ENT Exam Hub — Supabase Edge Function (Deno)
// ---------------------------------------------------------------------------
// Single endpoint with a POST action router, mirroring the original Apps
// Script backend. Auth is the number-only passcode, validated here against the
// database. Uses the service_role key (auto-injected by the platform) to read
// and write, bypassing RLS. The public site ships only the project URL + the
// anon/publishable key; this key never appears in the browser.
//
// CORS: we answer the OPTIONS preflight and attach CORS headers to every
// response. verify_jwt is disabled (see config.toml) so the preflight — which
// cannot carry an Authorization header — is not rejected by the gateway.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATIONS = ["Otology", "Rhinology", "General", "General 2", "Pediatric", "Head & Neck"];
const RESIDENT_IDS = ["R1", "R2", "R3", "R4", "R5", "R6"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// service_role client — bypasses RLS. Both env vars are auto-injected.
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const norm = (c: unknown): string => (c == null ? "" : String(c).trim());

/* ------------------------------- readers -------------------------------- */
async function readSetup() {
  const { data } = await db.from("exam_setup").select("*").eq("id", 1).single();
  return {
    examTitle: data?.exam_title ?? "ENT Exam",
    scoreMax: Number(data?.score_max ?? 100),
    adminCode: data?.admin_code ?? "",
  };
}
async function readExaminers() {
  const { data } = await db.from("exam_examiners").select("*");
  const rows = data ?? [];
  // return in the fixed station order
  return STATIONS.map((st) => {
    const r = rows.find((x: any) => x.station === st);
    return { station: st, passcode: r ? norm(r.passcode) : "" };
  });
}
async function readResidents() {
  const { data } = await db.from("exam_residents").select("*");
  const rows = data ?? [];
  return RESIDENT_IDS.map((rid) => {
    const r = rows.find((x: any) => x.resident_id === rid);
    return { residentId: rid, name: r ? String(r.name ?? "") : "" };
  });
}
async function readGrades() {
  const { data } = await db.from("exam_grades").select("*");
  return (data ?? []).map((g: any) => ({
    station: g.station,
    residentId: g.resident_id,
    score: Number(g.score),
    notes: String(g.notes ?? ""),
  }));
}
async function stationForCode(code: string): Promise<string | null> {
  code = norm(code);
  if (!code) return null;
  const ex = await readExaminers();
  const hit = ex.find((e) => e.passcode && e.passcode === code);
  return hit ? hit.station : null;
}

/* ------------------------------- actions -------------------------------- */
async function validateCode(body: any) {
  const code = norm(body.code);
  if (!code) return { ok: false, error: "Enter a passcode." };
  const setup = await readSetup();

  if (code === norm(setup.adminCode)) {
    return {
      ok: true,
      role: "admin",
      config: {
        examTitle: setup.examTitle,
        scoreMax: setup.scoreMax,
        adminCode: setup.adminCode,
        examiners: await readExaminers(),
        residents: await readResidents(),
      },
    };
  }

  const station = await stationForCode(code);
  if (station) {
    const myGrades = (await readGrades())
      .filter((g) => g.station === station)
      .map((g) => ({ residentId: g.residentId, score: g.score, notes: g.notes }));
    return {
      ok: true,
      role: "examiner",
      station,
      config: {
        examTitle: setup.examTitle,
        scoreMax: setup.scoreMax,
        residents: await readResidents(),
        myGrades,
      },
    };
  }
  return { ok: false, error: "Invalid passcode." };
}

async function submitGrade(body: any) {
  const code = norm(body.code);
  const station = await stationForCode(code);
  if (!station) return { ok: false, error: "Invalid passcode." };

  const residentId = norm(body.residentId);
  if (RESIDENT_IDS.indexOf(residentId) === -1) return { ok: false, error: "Unknown resident." };

  const setup = await readSetup();
  const score = Number(body.score);
  if (isNaN(score) || score < 0 || score > setup.scoreMax) {
    return { ok: false, error: "Score must be between 0 and " + setup.scoreMax + "." };
  }
  const notes = String(body.notes ?? "");

  const { error } = await db.from("exam_grades").upsert(
    {
      station,
      resident_id: residentId,
      score,
      notes,
      updated_at: new Date().toISOString(),
      examiner: station,
    },
    { onConflict: "station,resident_id" },
  );
  if (error) return { ok: false, error: "Could not save. Try again." };
  return { ok: true, saved: { residentId, score, notes } };
}

async function saveConfig(body: any) {
  const setup = await readSetup();
  if (norm(body.code) !== norm(setup.adminCode)) return { ok: false, error: "Admin passcode required." };

  const examTitle = norm(body.examTitle);
  const scoreMax = Number(body.scoreMax);
  const adminCode = norm(body.adminCode);
  if (!examTitle) return { ok: false, error: "Exam title is required." };
  if (isNaN(scoreMax) || scoreMax < 1) return { ok: false, error: "Maximum score must be a positive number." };
  if (!adminCode) return { ok: false, error: "Admin passcode is required." };

  const examiners = (body.examiners ?? []).map((e: any) => ({
    station: norm(e.station),
    passcode: norm(e.passcode),
  }));
  const residents = (body.residents ?? []).map((r: any) => ({
    residentId: norm(r.residentId),
    name: String(r.name ?? "").trim(),
  }));

  // uniqueness / collision checks (only among non-empty passcodes)
  const codes = examiners.filter((e: any) => e.passcode).map((e: any) => e.passcode);
  const seen: Record<string, boolean> = {};
  for (const c of codes) {
    if (seen[c]) return { ok: false, error: "Examiner passcodes must be unique." };
    seen[c] = true;
  }
  if (codes.indexOf(adminCode) !== -1) {
    return { ok: false, error: "Admin passcode must differ from every examiner code." };
  }

  // Setup (singleton)
  let r = await db.from("exam_setup").upsert(
    { id: 1, exam_title: examTitle, score_max: scoreMax, admin_code: adminCode },
    { onConflict: "id" },
  );
  if (r.error) return { ok: false, error: "Could not save configuration." };

  // Examiners (fixed stations). Never touches exam_grades.
  const exRows = STATIONS.map((st) => {
    const m = examiners.find((e: any) => e.station === st);
    return { station: st, passcode: m ? m.passcode : "" };
  });
  r = await db.from("exam_examiners").upsert(exRows, { onConflict: "station" });
  if (r.error) return { ok: false, error: "Could not save examiners." };

  // Residents (fixed ids). Renames keep grades (grades join on resident_id).
  const resRows = RESIDENT_IDS.map((rid) => {
    const m = residents.find((x: any) => x.residentId === rid);
    return { resident_id: rid, name: m ? m.name : "" };
  });
  r = await db.from("exam_residents").upsert(resRows, { onConflict: "resident_id" });
  if (r.error) return { ok: false, error: "Could not save residents." };

  return { ok: true };
}

async function getResults(body: any) {
  const setup = await readSetup();
  if (norm(body.code) !== norm(setup.adminCode)) return { ok: false, error: "Admin passcode required." };

  const residents = (await readResidents()).filter((r) => r.name);
  const examiners = await readExaminers();
  const stations = examiners.length ? examiners.map((e) => e.station) : STATIONS.slice();
  const grades = await readGrades();

  const grid: Record<string, Record<string, { score: number; notes: string }>> = {};
  const perResident: Record<string, { total: number | null; average: number | null; count: number }> = {};
  const stationAgg: Record<string, { sum: number; count: number }> = {};
  residents.forEach((r) => (grid[r.residentId] = {}));
  stations.forEach((st) => (stationAgg[st] = { sum: 0, count: 0 }));

  grades.forEach((g) => {
    if (!grid[g.residentId]) grid[g.residentId] = {};
    grid[g.residentId][g.station] = { score: g.score, notes: g.notes };
    if (stationAgg[g.station]) {
      stationAgg[g.station].sum += g.score;
      stationAgg[g.station].count++;
    }
  });

  residents.forEach((r) => {
    let sum = 0, count = 0;
    stations.forEach((st) => {
      const c = grid[r.residentId][st];
      if (c && c.score != null) { sum += Number(c.score); count++; }
    });
    perResident[r.residentId] = { total: count ? sum : null, average: count ? sum / count : null, count };
  });

  const perStation: Record<string, { average: number | null; count: number }> = {};
  stations.forEach((st) => {
    const s = stationAgg[st];
    perStation[st] = { average: s.count ? s.sum / s.count : null, count: s.count };
  });

  return {
    ok: true,
    examTitle: setup.examTitle,
    scoreMax: setup.scoreMax,
    stations,
    residents,
    grid,
    stats: { perResident, perStation },
  };
}

/* ------------------------------- router --------------------------------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "POST only." }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request body." }, 400);
  }

  try {
    switch (body.action) {
      case "validateCode": return json(await validateCode(body));
      case "submitGrade":  return json(await submitGrade(body));
      case "saveConfig":   return json(await saveConfig(body));
      case "getResults":   return json(await getResults(body));
      default:             return json({ ok: false, error: "Unknown action." });
    }
  } catch (err) {
    return json({ ok: false, error: "Server error: " + ((err as Error)?.message ?? String(err)) });
  }
});
