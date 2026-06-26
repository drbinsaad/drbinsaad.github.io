/* ============================================================================
 * ENT Exam Hub — frontend logic
 * Static GitHub Pages front end that talks to a Google Apps Script Web App
 * (see apps/exam-hub/Code.gs + SETUP.md). All passcode validation, grading
 * storage, and statistics happen server-side. No passcode list ships here.
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
function enterAdmin(config) {
  config = config || {};
  $("cfg-title").value = config.examTitle || "";
  $("cfg-max").value = config.scoreMax || 100;
  $("cfg-admincode").value = config.adminCode || session.code || "";

  // Examiner rows (fixed stations, editable passcodes)
  const exWrap = $("cfg-examiners");
  exWrap.innerHTML = "";
  const exMap = {};
  (config.examiners || []).forEach(function (e) { exMap[e.station] = e.passcode; });
  STATIONS.forEach(function (st) {
    const row = document.createElement("div");
    row.className = "config-row";
    row.innerHTML =
      '<label>' + escapeHtml(st) + '</label>' +
      '<input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" ' +
        'data-station="' + escapeHtml(st) + '" value="' + escapeHtml(exMap[st] != null ? String(exMap[st]) : "") + '" placeholder="code">';
    exWrap.appendChild(row);
  });

  // Resident rows (fixed ids R1..R6, editable names)
  const resWrap = $("cfg-residents");
  resWrap.innerHTML = "";
  const resMap = {};
  (config.residents || []).forEach(function (r) { resMap[r.residentId] = r.name; });
  RESIDENT_IDS.forEach(function (rid) {
    const row = document.createElement("div");
    row.className = "config-row";
    row.innerHTML =
      '<label>' + rid + '</label>' +
      '<input type="text" data-rid="' + rid + '" value="' + escapeHtml(resMap[rid] || "") + '" placeholder="Resident name" style="grid-column:auto;">';
    // make name field full-width by overriding the second column with a wide input
    row.style.gridTemplateColumns = "70px minmax(0,1fr)";
    resWrap.appendChild(row);
  });

  if (SHEET_URL) {
    const a = $("admin-open-sheet");
    a.href = SHEET_URL;
    a.classList.remove("is-hidden");
  }

  setMsg("admin-config-msg", "", "info");
  setMsg("admin-results-msg", "", "info");
  show("view-admin");
  refreshResults(); // auto-load current grid
}

async function saveConfig(btn) {
  const examTitle = $("cfg-title").value.trim();
  const scoreMax = Number($("cfg-max").value);
  const adminCode = $("cfg-admincode").value.trim();

  if (!examTitle) { setMsg("admin-config-msg", "Enter an exam title.", "warn"); return; }
  if (isNaN(scoreMax) || scoreMax < 1) { setMsg("admin-config-msg", "Maximum score must be a positive number.", "warn"); return; }
  if (!adminCode) { setMsg("admin-config-msg", "Set an admin passcode.", "warn"); return; }

  const examiners = [];
  document.querySelectorAll("#cfg-examiners input[data-station]").forEach(function (i) {
    examiners.push({ station: i.getAttribute("data-station"), passcode: i.value.trim() });
  });
  const residents = [];
  document.querySelectorAll("#cfg-residents input[data-rid]").forEach(function (i) {
    residents.push({ residentId: i.getAttribute("data-rid"), name: i.value.trim() });
  });

  // client-side duplicate / collision checks (server re-checks too)
  const codes = examiners.filter(function (e) { return e.passcode; }).map(function (e) { return e.passcode; });
  if (new Set(codes).size !== codes.length) { setMsg("admin-config-msg", "Examiner passcodes must be unique.", "warn"); return; }
  if (codes.indexOf(adminCode) !== -1) { setMsg("admin-config-msg", "The admin passcode must differ from every examiner code.", "warn"); return; }

  busy(btn, true);
  const r = await api("saveConfig", {
    code: session.code, examTitle: examTitle, scoreMax: scoreMax,
    adminCode: adminCode, examiners: examiners, residents: residents
  });
  busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save configuration');
  if (!r.ok) { setMsg("admin-config-msg", r.error || "Could not save configuration.", "warn"); return; }

  // adminCode may have changed -> update the live session so the next call still works
  session.code = adminCode;
  sessionStorage.setItem("examHubSession", JSON.stringify(session));
  setMsg("admin-config-msg", "Configuration saved.", "ok");
  refreshResults();
}

let lastResults = null;
async function refreshResults(btn) {
  if (btn) busy(btn, true);
  setMsg("admin-results-msg", "Loading…", "info");
  const r = await api("getResults", { code: session.code });
  if (btn) busy(btn, false, '<i class="fas fa-rotate"></i> Refresh results');
  if (!r.ok) { setMsg("admin-results-msg", r.error || "Could not load results.", "warn"); $("admin-results-wrap").classList.add("is-hidden"); return; }
  lastResults = r;
  renderResults(r);
  setMsg("admin-results-msg", "", "info");
}

function renderResults(r) {
  const stations = r.stations && r.stations.length ? r.stations : STATIONS;
  const residents = r.residents || [];
  const grid = r.grid || {};
  const stats = r.stats || { perResident: {}, perStation: {} };
  const max = r.scoreMax || cfgCache.scoreMax || 100;

  if (!residents.length) {
    $("admin-results-wrap").classList.add("is-hidden");
    setMsg("admin-results-msg", "No residents configured yet — add them in Exam Setup above.", "info");
    return;
  }

  let html = "<thead><tr><th class='r-head'>Resident</th>";
  stations.forEach(function (st) { html += "<th>" + escapeHtml(st) + "</th>"; });
  html += "<th>Total</th><th>Average</th></tr></thead><tbody>";

  residents.forEach(function (res) {
    const row = grid[res.residentId] || {};
    html += "<tr><td class='r-head'>" + escapeHtml(res.name || res.residentId) + "</td>";
    stations.forEach(function (st) {
      const cell = row[st];
      if (cell && cell.score != null && cell.score !== "") {
        html += "<td><span class='cell-score'>" + escapeHtml(String(cell.score)) + "</span></td>";
      } else {
        html += "<td class='empty'>—</td>";
      }
    });
    const ps = stats.perResident[res.residentId] || {};
    html += "<td class='total'>" + (ps.total != null ? ps.total : "—") + "</td>";
    html += "<td class='total'>" + (ps.average != null ? round1(ps.average) : "—") + "</td>";
    html += "</tr>";
  });

  // station-average footer row
  html += "<tr class='station-avg'><td class='r-head'>Station average</td>";
  stations.forEach(function (st) {
    const ss = stats.perStation[st] || {};
    html += "<td>" + (ss.average != null ? round1(ss.average) : "—") + "</td>";
  });
  html += "<td></td><td></td></tr>";
  html += "</tbody>";

  const table = $("admin-results-table");
  table.innerHTML = html;
  $("admin-results-wrap").classList.remove("is-hidden");
}

/* ----------------------------- Excel export ----------------------------- */
function exportXlsx() {
  if (!lastResults || !(lastResults.residents || []).length) {
    setMsg("admin-results-msg", "Nothing to export yet — refresh results first.", "warn");
    return;
  }
  if (typeof XLSX === "undefined") {
    setMsg("admin-results-msg", "Excel library failed to load. Check your connection and retry.", "warn");
    return;
  }
  const r = lastResults;
  const stations = r.stations && r.stations.length ? r.stations : STATIONS;
  const residents = r.residents || [];
  const grid = r.grid || {};
  const stats = r.stats || { perResident: {}, perStation: {} };

  const aoa = [];
  aoa.push([r.examTitle || "ENT Exam", "", "", "", "", "", "", ""]);
  aoa.push(["Exported", new Date().toLocaleString()]);
  aoa.push([]);
  const header = ["Resident"].concat(stations).concat(["Total", "Average"]);
  aoa.push(header);

  residents.forEach(function (res) {
    const row = grid[res.residentId] || {};
    const line = [res.name || res.residentId];
    stations.forEach(function (st) {
      const cell = row[st];
      line.push(cell && cell.score != null && cell.score !== "" ? cell.score : "");
    });
    const ps = stats.perResident[res.residentId] || {};
    line.push(ps.total != null ? ps.total : "");
    line.push(ps.average != null ? round1(ps.average) : "");
    aoa.push(line);
  });

  const avgLine = ["Station average"];
  stations.forEach(function (st) {
    const ss = stats.perStation[st] || {};
    avgLine.push(ss.average != null ? round1(ss.average) : "");
  });
  avgLine.push("", "");
  aoa.push(avgLine);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  const safe = (r.examTitle || "ENT-Exam").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  XLSX.writeFile(wb, safe + "-results.xlsx");
}

/* ------------------------------- utils ---------------------------------- */
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function round1(n) { return Math.round(Number(n) * 10) / 10; }

/* ------------------------------- wiring --------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  $("login-btn").addEventListener("click", doLogin);
  $("login-code").addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(); });
  $("examiner-logout").addEventListener("click", logout);
  $("admin-logout").addEventListener("click", logout);
  $("examiner-save-all").addEventListener("click", function () { saveAll(this); });
  $("admin-save-config").addEventListener("click", function () { saveConfig(this); });
  $("admin-refresh").addEventListener("click", function () { refreshResults(this); });
  $("admin-export-xlsx").addEventListener("click", exportXlsx);

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
