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
/* State for the examiner session. `questions` is [] for simple stations. */
let exam = { station: "", residents: [], questions: [], stationMax: 100, grades: {}, current: null };

function enterExaminer(station, config) {
  config = config || {};
  exam.station = station || "Station";
  exam.residents = config.residents || [];
  exam.questions = config.questions || [];
  exam.stationMax = config.stationMax || config.scoreMax || 100;
  exam.current = null;
  exam.grades = {};
  (config.myGrades || []).forEach(function (g) { exam.grades[g.residentId] = g; });
  cfgCache.scoreMax = exam.stationMax;

  $("examiner-exam-title").textContent = config.examTitle || "ENT Exam";
  $("examiner-station").textContent = station || "Station";
  $("examiner-intro").textContent = exam.questions.length
    ? "Pick a resident, then score each question — the total adds up automatically."
    : "Pick a resident, then enter their score and save.";

  renderResidentBar();
  $("examiner-body").innerHTML = '<p class="resident-hint">Select a resident above to begin.</p>';
  setMsg("examiner-msg", "", "info");
  show("view-examiner");
}

function renderResidentBar() {
  const bar = $("examiner-resident-bar");
  bar.innerHTML = "";
  if (!exam.residents.length) {
    bar.innerHTML = '<p class="resident-hint">No residents added yet. Ask the administrator to set up the exam.</p>';
    return;
  }
  exam.residents.forEach(function (res) {
    const g = exam.grades[res.residentId];
    const btn = document.createElement("button");
    btn.className = "resident-pill" + (exam.current === res.residentId ? " active" : "");
    btn.setAttribute("data-rid", res.residentId);
    btn.innerHTML = escapeHtml(res.name || res.residentId) +
      (g && g.score != null ? '<span class="badge">' + g.score + "/" + exam.stationMax + "</span>" : "");
    btn.addEventListener("click", function () { selectResident(res.residentId); });
    bar.appendChild(btn);
  });
}

function selectResident(rid) {
  exam.current = rid;
  renderResidentBar();
  setMsg("examiner-msg", "", "info");
  if (exam.questions.length) renderQuestionForm(rid);
  else renderSimpleForm(rid);
}

function residentName(rid) {
  const r = exam.residents.filter(function (x) { return x.residentId === rid; })[0];
  return r ? (r.name || rid) : rid;
}

/* ---- Question mode ---- */
function renderQuestionForm(rid) {
  const saved = exam.grades[rid] || {};
  const details = saved.details || {};
  const body = $("examiner-body");

  let html = '<div class="q-total"><span class="label">' + escapeHtml(residentName(rid)) +
    '</span><span class="value"><span id="q-running">0</span> / ' + exam.stationMax + '</span></div>';

  let qn = 0;
  exam.questions.forEach(function (q) {
    let imgs = "";
    (q.images || []).forEach(function (src) {
      const esc = escapeHtml(src);
      if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src)) {
        imgs += '<button type="button" class="q-thumb q-thumb-video" data-full="' + esc + '" data-video="1" aria-label="Play video">' +
                  '<video src="' + esc + '#t=0.1" muted preload="metadata" playsinline></video>' +
                  '<span class="q-play" aria-hidden="true">&#9654;</span>' +
                '</button>';
      } else {
        imgs += '<img class="q-thumb" src="' + esc + '" alt="Image" data-full="' + esc + '">';
      }
    });

    // Stem / case-presentation card (0 marks): read-only, no score input, not counted.
    if (!Number(q.maxMarks)) {
      html +=
        '<div class="q-card q-stem">' +
          '<div class="q-stem-eyebrow">Case</div>' +
          '<div class="q-stem-text">' + escapeHtml(q.prompt) + '</div>' +
          (imgs ? '<div class="q-images">' + imgs + "</div>" : "") +
        "</div>";
      return;
    }

    qn += 1;
    const qid = q.questionId;
    // SCFHS marking sheet: one scored row per answer point (mark parsed from the
    // trailing "(N mark[s])"); lines that are notes — starting with "(" — are shown
    // unscored. The examiner marks each point; the question total auto-sums.
    let rows = "";
    let scoredPoints = 0;
    (q.modelAnswers || []).forEach(function (m, idx) {
      const mk = m.match(/\((\d+(?:\.\d+)?)\s*marks?\)\s*$/); // scored if it ends in "(N marks)"
      if (!mk) {
        rows += '<tr class="g-note"><td colspan="2">' + escapeHtml(m) + "</td></tr>";
        return;
      }
      scoredPoints += 1;
      const pmax = mk[1];
      const text = m.slice(0, mk.index).trim();
      rows +=
        "<tr>" +
          '<td class="g-ans">' + escapeHtml(text) + "</td>" +
          '<td class="g-mark">' +
            '<input type="number" class="pt-input" min="0" max="' + pmax + '" step="0.5" inputmode="decimal" ' +
              'data-qid="' + escapeHtml(qid) + '" data-pidx="' + idx + '" data-pmax="' + pmax + '" placeholder="0">' +
            '<span class="g-of">/ ' + pmax + "</span>" +
          "</td>" +
        "</tr>";
    });
    // Fallback: a scored question with no per-point marks gets one whole-question
    // input (0..maxMarks) so it can always be graded.
    if (scoredPoints === 0) {
      rows +=
        "<tr>" +
          '<td class="g-ans">Score for this question</td>' +
          '<td class="g-mark">' +
            '<input type="number" class="pt-input" min="0" max="' + q.maxMarks + '" step="0.5" inputmode="decimal" ' +
              'data-qid="' + escapeHtml(qid) + '" data-pidx="0" data-pmax="' + q.maxMarks + '" placeholder="0">' +
            '<span class="g-of">/ ' + q.maxMarks + "</span>" +
          "</td>" +
        "</tr>";
    }

    html +=
      '<div class="q-card">' +
        '<div class="q-head">' +
          '<div class="q-prompt"><span class="q-num">Q' + qn + "</span>" + escapeHtml(q.prompt) + "</div>" +
          '<div class="q-score">' +
            '<span class="q-qtotal" id="qt-' + escapeHtml(qid) + '" data-qid="' + escapeHtml(qid) + '" data-max="' + q.maxMarks + '">0</span>' +
            '<span class="max">/ ' + q.maxMarks + "</span>" +
          "</div>" +
        "</div>" +
        (imgs ? '<div class="q-images">' + imgs + "</div>" : "") +
        '<table class="q-guide-table"><thead><tr>' +
          "<th>Marking guide / key answer — what the resident should say</th><th>Mark</th>" +
        "</tr></thead><tbody>" + rows + "</tbody></table>" +
      "</div>";
  });

  html +=
    '<div class="q-notes"><textarea id="q-notes" placeholder="Overall notes for this resident (optional)">' +
      escapeHtml(saved.notes || "") + "</textarea></div>" +
    '<div class="action-row"><button class="action-btn primary-btn" id="q-save"><i class="fas fa-floppy-disk"></i> Save ' +
      escapeHtml(residentName(rid)) + "</button></div>";

  body.innerHTML = html;

  restorePoints(rid);
  body.querySelectorAll('.pt-input').forEach(function (i) {
    i.addEventListener("input", function () { recomputeTotal(); persistPoints(rid); });
  });
  body.querySelectorAll('.q-thumb').forEach(function (im) {
    im.addEventListener("click", function () {
      openMedia(im.getAttribute("data-full"), im.getAttribute("data-video") === "1");
    });
  });
  $("q-save").addEventListener("click", function () { saveQuestionGrade(rid, this); });
  recomputeTotal();
}

function round1(n) { return Math.round(Number(n) * 10) / 10; }

// Sum each question's per-point inputs into its total, then sum the station total.
function recomputeTotal() {
  let station = 0;
  document.querySelectorAll('#examiner-body .q-qtotal').forEach(function (span) {
    const qid = span.getAttribute("data-qid");
    const qmax = Number(span.getAttribute("data-max"));
    let qt = 0;
    document.querySelectorAll('#examiner-body .pt-input[data-qid="' + qid + '"]').forEach(function (i) {
      let v = Number(i.value);
      const pmax = Number(i.getAttribute("data-pmax"));
      if (isNaN(v) || v < 0) v = 0;
      if (v > pmax) { v = pmax; i.value = pmax; }
      qt += v;
    });
    if (qt > qmax) qt = qmax;
    span.textContent = round1(qt);
    station += qt;
  });
  const el = $("q-running");
  if (el) el.textContent = round1(station);
}

// Per-point entries persist on the examiner's device so navigating between
// residents (or a reload) restores the marking sheet. The server stores the
// per-question total (sum), which is what the admin grid and Excel use.
function ptStoreKey(rid) { return "examPts:" + session.station + ":" + rid; }
// Only persist/restore for a real examiner station; never with a missing station
// (would collapse every station to one key and let marks bleed across stations).
function ptStorable() { return !!session.station; }
// Signature of the current question structure; if it changes (questions/points
// edited), stored per-point marks no longer line up by index, so we ignore them.
function ptSig() {
  return (exam.questions || []).map(function (q) {
    return q.questionId + ":" + ((q.modelAnswers || []).length);
  }).join(",");
}
function persistPoints(rid) {
  if (!ptStorable()) return;
  try {
    const data = {};
    document.querySelectorAll('#examiner-body .pt-input').forEach(function (i) {
      if (i.value === "") return;
      const qid = i.getAttribute("data-qid"), pidx = i.getAttribute("data-pidx");
      (data[qid] = data[qid] || {})[pidx] = i.value;
    });
    localStorage.setItem(ptStoreKey(rid), JSON.stringify({ sig: ptSig(), data: data }));
  } catch (e) {}
}
function restorePoints(rid) {
  if (!ptStorable()) return;
  try {
    const raw = localStorage.getItem(ptStoreKey(rid));
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || saved.sig !== ptSig() || !saved.data) return; // structure changed → drop stale marks
    const data = saved.data;
    document.querySelectorAll('#examiner-body .pt-input').forEach(function (i) {
      const qid = i.getAttribute("data-qid"), pidx = i.getAttribute("data-pidx");
      if (data[qid] && data[qid][pidx] != null) i.value = data[qid][pidx];
    });
  } catch (e) {}
}

async function saveQuestionGrade(rid, btn) {
  recomputeTotal();
  const details = {};
  document.querySelectorAll('#examiner-body .q-qtotal').forEach(function (span) {
    const qid = span.getAttribute("data-qid");
    let any = false;
    document.querySelectorAll('#examiner-body .pt-input[data-qid="' + qid + '"]').forEach(function (i) {
      if (i.value !== "") any = true;
    });
    if (any) details[qid] = Number(span.textContent); // unscored question = leave out
  });

  const notes = ($("q-notes") && $("q-notes").value) || "";
  busy(btn, true);
  const r = await api("submitGrade", { code: session.code, residentId: rid, details: details, notes: notes });
  busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save ' + residentName(rid));
  if (!r.ok) { setMsg("examiner-msg", r.error || "Could not save.", "warn"); return; }

  exam.grades[rid] = { residentId: rid, score: r.saved.score, notes: notes, details: r.saved.details };
  renderResidentBar();
  setMsg("examiner-msg", "Saved " + residentName(rid) + " — total " + r.saved.score + "/" + exam.stationMax + " at " + timeNow() + ".", "ok");
}

/* ---- Simple mode (stations with no questions) ---- */
function renderSimpleForm(rid) {
  const saved = exam.grades[rid] || {};
  const max = exam.stationMax;
  $("examiner-body").innerHTML =
    '<div class="q-card"><div class="q-head">' +
      '<div class="q-prompt">' + escapeHtml(residentName(rid)) + '</div>' +
      '<div class="q-score">' +
        '<input type="number" min="0" max="' + max + '" step="1" inputmode="numeric" id="simple-score" ' +
          'value="' + (saved.score != null ? saved.score : "") + '" placeholder="0"><span class="max">/ ' + max + '</span>' +
      '</div></div>' +
      '<div class="q-notes"><textarea id="q-notes" placeholder="Notes (optional)">' + escapeHtml(saved.notes || "") + '</textarea></div>' +
    '</div>' +
    '<div class="action-row"><button class="action-btn primary-btn" id="q-save"><i class="fas fa-floppy-disk"></i> Save ' + escapeHtml(residentName(rid)) + '</button></div>';
  $("q-save").addEventListener("click", function () { saveSimpleGrade(rid, this); });
}

async function saveSimpleGrade(rid, btn) {
  const input = $("simple-score");
  if (!input || input.value === "") { setMsg("examiner-msg", "Enter a score before saving.", "warn"); return; }
  const score = Number(input.value);
  const max = exam.stationMax;
  if (isNaN(score) || score < 0 || score > max) { setMsg("examiner-msg", "Score must be between 0 and " + max + ".", "warn"); return; }
  const notes = ($("q-notes") && $("q-notes").value) || "";
  busy(btn, true);
  const r = await api("submitGrade", { code: session.code, residentId: rid, score: score, notes: notes });
  busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save ' + residentName(rid));
  if (!r.ok) { setMsg("examiner-msg", r.error || "Could not save.", "warn"); return; }
  exam.grades[rid] = { residentId: rid, score: score, notes: notes };
  renderResidentBar();
  setMsg("examiner-msg", "Saved " + residentName(rid) + " — " + score + "/" + max + " at " + timeNow() + ".", "ok");
}

/* ---- Fullscreen media viewer (images and video) ---- */
function openMedia(src, isVideo) {
  const img = $("img-overlay-img");
  const vid = $("img-overlay-video");
  if (isVideo && vid) {
    img.classList.add("is-hidden"); img.src = "";
    vid.src = src; vid.classList.remove("is-hidden");
    try { vid.currentTime = 0; } catch (e) {}
    vid.play().catch(function () {});
  } else {
    if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid.classList.add("is-hidden"); }
    img.src = src; img.classList.remove("is-hidden");
  }
  $("img-overlay").classList.remove("is-hidden");
}
function openImage(src) { openMedia(src, false); } // back-compat
function closeImage() {
  $("img-overlay").classList.add("is-hidden");
  $("img-overlay-img").src = "";
  const vid = $("img-overlay-video");
  if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid.classList.add("is-hidden"); }
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

  // Fullscreen media viewer: click backdrop/image (or close button, or Esc) to
  // dismiss; clicks on the video (its controls) must not close it.
  $("img-overlay").addEventListener("click", function (e) {
    if (e.target === this || e.target.id === "img-overlay-img") closeImage();
  });
  $("img-overlay-close").addEventListener("click", closeImage);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeImage(); });

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
