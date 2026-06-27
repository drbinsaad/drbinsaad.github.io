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

const OWNER_EMAIL = (Deno.env.get("OWNER_EMAIL") ?? "drbinsaad@gmail.com").toLowerCase();

/* ----------------------------- admin auth ------------------------------- */
// Returns the owner's email if the request carries a valid OWNER Google JWT,
// else null. Anon/publishable keys also arrive as Bearer tokens on examiner
// calls — those aren't user JWTs, so getUser() yields no user and we return null.
async function ownerFromJwt(req: Request): Promise<string | null> {
  const h = req.headers.get("Authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1].trim();
  if (!token || token.indexOf(".") === -1) return null; // not a JWT (e.g. sb_publishable_…)
  try {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data?.user) return null;
    const email = (data.user.email ?? "").toLowerCase();
    return email === OWNER_EMAIL ? email : null;
  } catch {
    return null;
  }
}

// Admin authorized by EITHER a valid owner Google JWT OR the admin passcode
// (break-glass fallback used by exam-hub.html).
async function isAdmin(req: Request, body: any): Promise<boolean> {
  if (await ownerFromJwt(req)) return true;
  const setup = await readSetup();
  return norm(body.code) !== "" && norm(body.code) === norm(setup.adminCode);
}

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
    details: g.details && typeof g.details === "object" ? g.details : {},
  }));
}
// Ordered question set for a station (empty array => station uses simple scoring).
async function readQuestions(station: string) {
  const { data } = await db.from("exam_questions").select("*").eq("station", station);
  return (data ?? [])
    .map((q: any) => ({
      questionId: q.question_id,
      ord: Number(q.ord ?? 0),
      prompt: String(q.prompt ?? ""),
      maxMarks: Number(q.max_marks ?? 0),
      modelAnswers: Array.isArray(q.model_answers) ? q.model_answers : [],
      images: Array.isArray(q.images) ? q.images : [],
    }))
    .sort((a, b) => a.ord - b.ord);
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
      .map((g) => ({ residentId: g.residentId, score: g.score, notes: g.notes, details: g.details }));
    const questions = await readQuestions(station);
    const stationMax = questions.reduce((s, q) => s + q.maxMarks, 0);
    return {
      ok: true,
      role: "examiner",
      station,
      config: {
        examTitle: setup.examTitle,
        scoreMax: setup.scoreMax,
        residents: await readResidents(),
        questions,                                   // [] => simple scoring
        stationMax: questions.length ? stationMax : setup.scoreMax,
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

  const notes = String(body.notes ?? "");
  let score: number;
  let details: Record<string, number> = {};

  if (body.details && typeof body.details === "object") {
    // Question mode: validate each per-question score against its max, then sum.
    const questions = await readQuestions(station);
    if (!questions.length) return { ok: false, error: "This station has no questions configured." };
    const byId: Record<string, number> = {};
    questions.forEach((q) => (byId[q.questionId] = q.maxMarks));
    let total = 0;
    for (const qid of Object.keys(body.details)) {
      if (!(qid in byId)) continue; // ignore unknown question ids
      const v = Number(body.details[qid]);
      if (isNaN(v) || v < 0 || v > byId[qid]) {
        return { ok: false, error: "Score for " + qid + " must be between 0 and " + byId[qid] + "." };
      }
      details[qid] = v;
      total += v;
    }
    score = total;
  } else {
    // Simple mode: single score against the global max.
    const setup = await readSetup();
    score = Number(body.score);
    if (isNaN(score) || score < 0 || score > setup.scoreMax) {
      return { ok: false, error: "Score must be between 0 and " + setup.scoreMax + "." };
    }
  }

  const { error } = await db.from("exam_grades").upsert(
    {
      station,
      resident_id: residentId,
      score,
      notes,
      details,
      updated_at: new Date().toISOString(),
      examiner: station,
    },
    { onConflict: "station,resident_id" },
  );
  if (error) return { ok: false, error: "Could not save. Try again." };
  return { ok: true, saved: { residentId, score, notes, details } };
}

// Owner-page bootstrap: confirms the caller is the owner and returns admin config.
async function whoami(req: Request) {
  if (!(await ownerFromJwt(req))) return { ok: true, owner: false };
  const setup = await readSetup();
  return {
    ok: true,
    owner: true,
    config: {
      examTitle: setup.examTitle,
      scoreMax: setup.scoreMax,
      adminCode: setup.adminCode,
      examiners: await readExaminers(),
      residents: await readResidents(),
    },
  };
}

async function saveConfig(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };

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

async function getResults(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };
  const setup = await readSetup();

  const residents = (await readResidents()).filter((r) => r.name);
  const examiners = await readExaminers();
  const stations = examiners.length ? examiners.map((e) => e.station) : STATIONS.slice();
  const grades = await readGrades();

  const grid: Record<string, Record<string, { score: number; notes: string; details?: any }>> = {};
  const perResident: Record<string, { total: number | null; average: number | null; count: number }> = {};
  const stationAgg: Record<string, { sum: number; count: number }> = {};
  residents.forEach((r) => (grid[r.residentId] = {}));
  stations.forEach((st) => (stationAgg[st] = { sum: 0, count: 0 }));

  grades.forEach((g) => {
    if (!grid[g.residentId]) grid[g.residentId] = {};
    grid[g.residentId][g.station] = { score: g.score, notes: g.notes, details: g.details };
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

// Admin: clear grades for one resident (all stations) or for everyone.
// Used to reset trial-run scores before the real exam. Owner-only.
async function clearGrades(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };
  const residentId = norm(body.residentId);
  let q = db.from("exam_grades").delete();
  if (residentId && residentId.toLowerCase() !== "all") {
    if (RESIDENT_IDS.indexOf(residentId) === -1) return { ok: false, error: "Unknown resident." };
    q = q.eq("resident_id", residentId);
  } else {
    q = q.in("resident_id", RESIDENT_IDS); // matches all → clears everything
  }
  const { error } = await q;
  if (error) return { ok: false, error: "Could not clear results." };
  return { ok: true, cleared: residentId || "all" };
}

/* --------------------------- question editor ---------------------------- */
// Sum of the "(N mark[s])" suffixes on the answer points — authoritative max.
function sumPointMarks(modelAnswers: any[]): number {
  let sum = 0;
  for (const m of modelAnswers) {
    const mm = String(m).match(/\((\d+(?:\.\d+)?)\s*marks?\)\s*$/);
    if (mm) sum += parseFloat(mm[1]);
  }
  return Math.round(sum * 10) / 10;
}

// Admin: load a station's questions for editing.
async function getQuestions(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };
  const station = norm(body.station);
  if (STATIONS.indexOf(station) === -1) return { ok: false, error: "Unknown station." };
  const setup = await readSetup();
  return { ok: true, station, scoreMax: setup.scoreMax, questions: await readQuestions(station) };
}

// Admin: replace a station's questions. Rejects unless the scored total == score_max.
async function saveQuestions(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };
  const station = norm(body.station);
  if (STATIONS.indexOf(station) === -1) return { ok: false, error: "Unknown station." };
  const setup = await readSetup();
  const incoming = Array.isArray(body.questions) ? body.questions : [];

  const rows: any[] = [];
  const seen: Record<string, boolean> = {};
  let total = 0;
  for (let i = 0; i < incoming.length; i++) {
    const q = incoming[i] || {};
    const qid = norm(q.questionId) || ("Q" + i);
    if (seen[qid]) return { ok: false, error: "Duplicate question id: " + qid };
    seen[qid] = true;
    const prompt = String(q.prompt ?? "").trim();
    const modelAnswers = Array.isArray(q.modelAnswers) ? q.modelAnswers.map((x: any) => String(x)) : [];
    const images = Array.isArray(q.images) ? q.images.map((x: any) => String(x)).filter((s: string) => s) : [];
    if (!prompt && !modelAnswers.length && !images.length) continue; // skip blank rows
    const maxMarks = sumPointMarks(modelAnswers);
    rows.push({ station, question_id: qid, ord: i, prompt, max_marks: maxMarks, model_answers: modelAnswers, images });
    total += maxMarks;
  }

  total = Math.round(total * 10) / 10;
  if (Math.abs(total - Number(setup.scoreMax)) > 0.05) {
    return { ok: false, error: "Station total is " + total + " — it must equal " + setup.scoreMax + " before saving." };
  }

  // Snapshot the station's current rows so we can roll back if the insert fails.
  const { data: snapshot } = await db.from("exam_questions").select("*").eq("station", station);
  const del = await db.from("exam_questions").delete().eq("station", station);
  if (del.error) return { ok: false, error: "Could not clear old questions." };
  if (rows.length) {
    const ins = await db.from("exam_questions").insert(rows);
    if (ins.error) {
      if (snapshot && snapshot.length) {
        const restore = await db.from("exam_questions").insert(snapshot); // roll back
        if (restore.error) {
          return { ok: false, error: "Could not save questions, and the previous questions could not be restored — this station is now empty. Please re-enter and save. (" + ins.error.message + ")" };
        }
      }
      return { ok: false, error: "Could not save questions: " + ins.error.message };
    }
  }
  return { ok: true, station, total, count: rows.length };
}

// Admin: upload an image to the public exam-images bucket, return its URL.
// Locked to real raster image types (no SVG/HTML → no stored XSS) and 5 MB.
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
async function uploadImage(req: Request, body: any) {
  if (!(await isAdmin(req, body))) return { ok: false, error: "Admin authorization required." };
  const safe = (norm(body.filename).replace(/[^a-zA-Z0-9._-]/g, "_") || "image.jpg").slice(0, 80);
  const dataB64 = String(body.dataBase64 ?? "");
  let contentType = (norm(body.contentType) || "image/jpeg").toLowerCase();
  if (contentType === "image/jpg") contentType = "image/jpeg"; // normalize non-standard MIME
  if (!dataB64) return { ok: false, error: "No image data." };
  if (ALLOWED_IMAGE_TYPES.indexOf(contentType) === -1) {
    return { ok: false, error: "Only PNG, JPEG, WebP or GIF images are allowed." };
  }
  let bytes: Uint8Array;
  try {
    const bin = atob(dataB64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch {
    return { ok: false, error: "Invalid image data." };
  }
  if (bytes.length > 5 * 1024 * 1024) return { ok: false, error: "Image too large (max 5 MB)." };
  const bucket = "exam-images";
  try { await db.storage.createBucket(bucket, { public: true }); } catch (_) { /* exists */ }
  try { await db.storage.updateBucket(bucket, { public: true }); } catch (_) { /* ensure a pre-existing bucket is public, else URLs 404 */ }
  const path = crypto.randomUUID() + "-" + safe; // unique → no overwrite of other images
  const up = await db.storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (up.error) return { ok: false, error: "Upload failed: " + up.error.message };
  const url = Deno.env.get("SUPABASE_URL")! + "/storage/v1/object/public/" + bucket + "/" + path;
  return { ok: true, url };
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
      case "validateCode": return json(await validateCode(body));        // examiner/admin passcode
      case "submitGrade":  return json(await submitGrade(body));         // examiner passcode
      case "whoami":       return json(await whoami(req));               // owner Google JWT
      case "saveConfig":   return json(await saveConfig(req, body));     // owner JWT or passcode
      case "getResults":   return json(await getResults(req, body));     // owner JWT or passcode
      case "getQuestions": return json(await getQuestions(req, body));   // owner JWT or passcode
      case "saveQuestions":return json(await saveQuestions(req, body));  // owner JWT or passcode
      case "uploadImage":  return json(await uploadImage(req, body));    // owner JWT or passcode
      case "clearGrades":  return json(await clearGrades(req, body));    // owner JWT or passcode
      default:             return json({ ok: false, error: "Unknown action." });
    }
  } catch (err) {
    return json({ ok: false, error: "Server error: " + ((err as Error)?.message ?? String(err)) });
  }
});
