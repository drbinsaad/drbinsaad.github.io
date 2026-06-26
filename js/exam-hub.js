/* ============================================================================
 * ENT Exam Hub — examiner + passcode-admin frontend logic
 * Static GitHub Pages front end that talks to the Supabase Edge Function
 * `exam-hub` (see supabase/functions/exam-hub/index.ts + apps/exam-hub/
 * SETUP-supabase.md). All passcode validation, grading storage, and statistics
 * happen server-side. No passcode list ships here. The admin screen itself is
 * the shared module js/exam-admin-ui.js (also used by the Google-login
 * owner page admin.html).
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * CONFIG — Supabase backend.
 * SUPABASE_URL + SUPABASE_ANON are PUBLIC by design (safe to commit): the
 * anon/publishable key can't read or write the data on its own — Row-Level
 * Security blocks it, and only the exam-hub Edge Function (which holds the
 * secret service key) touches the database after checking the passcode.
 * ------------------------------------------------------------------------ */
const SUPABASE_URL  = "https://drsamkdxsfrolzyvxsjb.supabase.co";
const SUPABASE_ANON = "sb_publishable_BxB2XjnPjFQ2yScmMJHbpA_T98Bv4Ag";
const EXAM_FN_URL   = SUPABASE_URL + "/functions/v1/exam-hub";
const SHEET_URL     = ""; // not used with Supabase; keeps the "Open Sheet" button hidden

/* Fixed station order — must match the Examiners tab in the Sheet / Code.gs */
const STATIONS = ["Otology", "Rhinology", "General", "General 2", "Pediatric", "Head & Neck"];
const RESIDENT_IDS = ["R1", "R2", "R3", "R4", "R5", "R6"];

/* In-memory session (mirrored to sessionStorage so a refresh doesn't log out) */
let session = { code: null, role: null, station: null };
let cfgCache = { scoreMax: 100 }; // last-known config for the examiner view

/* ---------------------------------------------------------------------------
 * Transport — POST JSON to the Supabase Edge Function.
 * The function answers the CORS preflight and is deployed with verify_jwt=off,
 * so a normal application/json request with the anon key works. The `apikey`
 * header is required for the Supabase gateway to route to the function.
 * ------------------------------------------------------------------------ */
async function api(action, payload) {
  if (!SUPABASE_URL || SUPABASE_URL.indexOf("PASTE_YOUR") === 0) {
    return { ok: false, error: "Backend not configured yet. Set SUPABASE_URL / SUPABASE_ANON in js/exam-hub.js." };
  }
  try {
    const res = await fetch(EXAM_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON,
        "Authorization": "Bearer " + SUPABASE_ANON
      },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      return { ok: false, error: "Unexpected server response from the backend.", raw: text.slice(0, 300) };
    }
  } catch (netErr) {
    return { ok: false, error: "Network error. If the exam isn't running, the database may be paused — check the Supabase dashboard." };
  }
}

/* --------------------------- small DOM helpers --------------------------- */
function $(id) { return document.getElementById(id); }
function show(viewId) {
  ["view-login", "view-examiner", "view-admin"].forEach(function (v) {
    $(v).classList.toggle("is-hidden", v !== viewId);
  });
  window.scrollTo(0, 0);
}
function setMsg(id, text, kind) {
  const el = $(id);
  el.textContent = text;
  el.className = "callout callout-" + (kind || "info") + (text ? "" : " is-hidden");
}
function busy(btn, on, idleHtml) {
  if (on) {
    btn.dataset.idle = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = idleHtml || btn.dataset.idle || btn.innerHTML;
    btn.disabled = false;
  }
}
function timeNow() {
  const d = new Date();
  const h = ("0" + d.getHours()).slice(-2);
  const m = ("0" + d.getMinutes()).slice(-2);
  return h + ":" + m;
}

/* ============================== LOGIN ==================================== */
async function doLogin() {
  const code = ($("login-code").value || "").trim();
  if (!code) { setMsg("login-error", "Enter your passcode.", "warn"); return; }
  const btn = $("login-btn");
  busy(btn, true);
  const r = await api("validateCode", { code: code });
  busy(btn, false);
  if (!r.ok) { setMsg("login-error", r.error || "Invalid passcode.", "warn"); return; }

  session = { code: code, role: r.role, station: r.station || null };
  sessionStorage.setItem("examHubSession", JSON.stringify(session));
  setMsg("login-error", "", "warn");
  $("login-code").value = "";

  if (r.role === "admin") {
    cfgCache = r.config || cfgCache;
    enterAdmin(r.config);
  } else {
    cfgCache = r.config || cfgCache;
    enterExaminer(r.station, r.config);
  }
}

function logout() {
  session = { code: null, role: null, station: null };
  sessionStorage.removeItem("examHubSession");
  show("view-login");
}

/* ============================ EXAMINER VIEW ============================== */
function enterExaminer(station, config) {
  config = config || {};
  $("examiner-exam-title").textContent = config.examTitle || "ENT Exam";
  $("examiner-station").textContent = station || "Station";
  const max = config.scoreMax || 100;
  cfgCache.scoreMax = max;

  const residents = config.residents || [];
  const myGrades = {};
  (config.myGrades || []).forEach(function (g) { myGrades[g.residentId] = g; });

  const wrap = $("examiner-residents");
  wrap.innerHTML = "";
  if (!residents.length) {
    wrap.innerHTML = '<div class="resident-card"><p style="color:#9a9389;">No residents have been added yet. Ask the administrator to set up the exam.</p></div>';
  }
  residents.forEach(function (res) {
    const g = myGrades[res.residentId] || {};
    const card = document.createElement("div");
    card.className = "resident-card";
    card.innerHTML =
      '<div class="r-name">' + escapeHtml(res.name || res.residentId) +
        '<span class="r-tag">' + res.residentId + '</span></div>' +
      '<div class="score-field">' +
        '<input type="number" min="0" max="' + max + '" step="1" inputmode="numeric" ' +
          'data-rid="' + res.residentId + '" value="' + (g.score != null ? g.score : "") + '" placeholder="0">' +
        '<span class="max">/ ' + max + '</span>' +
      '</div>' +
      '<textarea data-notes="' + res.residentId + '" placeholder="Notes (optional)">' + escapeHtml(g.notes || "") + '</textarea>' +
      '<button class="action-btn primary-btn" data-save="' + res.residentId + '">' +
        '<i class="fas fa-floppy-disk"></i> Save</button>';
    wrap.appendChild(card);
  });

  // wire per-card save buttons
  wrap.querySelectorAll("[data-save]").forEach(function (b) {
    b.addEventListener("click", function () { saveOne(b.getAttribute("data-save"), b); });
  });

  setMsg("examiner-msg", "", "info");
  show("view-examiner");
}

function readGrade(rid) {
  const input = document.querySelector('#examiner-residents input[data-rid="' + rid + '"]');
  const notes = document.querySelector('#examiner-residents textarea[data-notes="' + rid + '"]');
  return { score: input ? input.value : "", notes: notes ? notes.value : "", input: input };
}

async function saveOne(rid, btn) {
  const g = readGrade(rid);
  if (g.score === "" || g.score === null) { setMsg("examiner-msg", "Enter a score before saving.", "warn"); return; }
  const score = Number(g.score);
  const max = cfgCache.scoreMax || 100;
  if (isNaN(score) || score < 0 || score > max) {
    setMsg("examiner-msg", "Score must be a number between 0 and " + max + ".", "warn");
    if (g.input) g.input.focus();
    return;
  }
  busy(btn, true);
  const r = await api("submitGrade", { code: session.code, residentId: rid, score: score, notes: g.notes });
  if (!r.ok) {
    busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save');
    setMsg("examiner-msg", r.error || "Could not save.", "warn");
    return;
  }
  btn.dataset.idle = '<i class="fas fa-check"></i> Saved ' + timeNow();
  busy(btn, false);
  btn.classList.add("is-saved");
  setMsg("examiner-msg", "", "info");
}

async function saveAll(btn) {
  busy(btn, true);
  const buttons = Array.prototype.slice.call(document.querySelectorAll("#examiner-residents [data-save]"));
  let saved = 0, skipped = 0, failed = 0;
  const max = cfgCache.scoreMax || 100;
  for (let i = 0; i < buttons.length; i++) {
    const rid = buttons[i].getAttribute("data-save");
    const g = readGrade(rid);
    if (g.score === "" || g.score === null) { skipped++; continue; }
    const score = Number(g.score);
    if (isNaN(score) || score < 0 || score > max) { failed++; continue; }
    const r = await api("submitGrade", { code: session.code, residentId: rid, score: score, notes: g.notes });
    if (r.ok) {
      saved++;
      buttons[i].dataset.idle = '<i class="fas fa-check"></i> Saved ' + timeNow();
      buttons[i].innerHTML = buttons[i].dataset.idle;
      buttons[i].classList.add("is-saved");
    } else { failed++; }
  }
  busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save all');
  let parts = [saved + " saved"];
  if (skipped) parts.push(skipped + " left blank");
  if (failed) parts.push(failed + " failed");
  setMsg("examiner-msg", parts.join(" · "), failed ? "warn" : "ok");
}

/* ============================== ADMIN VIEW ============================== */
/* The admin screen lives in the shared module js/exam-admin-ui.js. Here it is
 * used as a break-glass fallback: logging in with the admin passcode opens it.
 * We pass an `api` that injects the passcode (the server also accepts a Google
 * owner JWT on admin.html). adminUi is created on DOMContentLoaded. */
let adminUi = null;
function enterAdmin(config) {
  if (!adminUi) return;
  show("view-admin");
  adminUi.enterAdmin(config);
}

/* ------------------------------- utils ---------------------------------- */
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ------------------------------- wiring --------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  // Shared admin UI, authenticated here with the admin passcode (break-glass).
  adminUi = window.ExamAdminUI({
    api: function (action, payload) {
      return api(action, Object.assign({ code: session.code }, payload || {}));
    },
    onConfigSaved: function (newAdminCode) {
      session.code = newAdminCode; // admin code may have changed; keep session valid
      sessionStorage.setItem("examHubSession", JSON.stringify(session));
    }
  });

  $("login-btn").addEventListener("click", doLogin);
  $("login-code").addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(); });
  $("examiner-logout").addEventListener("click", logout);
  $("admin-logout").addEventListener("click", logout);
  $("examiner-save-all").addEventListener("click", function () { saveAll(this); });

  // Restore a session on refresh (re-validate against the server for fresh config)
  const saved = sessionStorage.getItem("examHubSession");
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (s && s.code) {
        session = s;
        api("validateCode", { code: s.code }).then(function (r) {
          if (!r.ok) { logout(); return; }
          if (r.role === "admin") { cfgCache = r.config || cfgCache; enterAdmin(r.config); }
          else { cfgCache = r.config || cfgCache; enterExaminer(r.station, r.config); }
        });
      }
    } catch (e) { /* ignore */ }
  }
});
