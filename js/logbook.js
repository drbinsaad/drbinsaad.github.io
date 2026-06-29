/* ============================================================================
 * Consultant Logbook (logbook.html) — local-first, optional cloud sync.
 *
 * DATA MODEL
 *  - Every case row has a stable client-generated `id` (uuid) and an
 *    `updated_at` ISO timestamp. The same id is shared between the on-device
 *    store and the cloud, which is what makes two-way sync possible.
 *
 * STORAGE
 *  - Default: IndexedDB on this device. Works fully offline, no login, $0.
 *  - Optional: "Sign in to sync" mirrors rows to Supabase (Google-OAuth,
 *    owner-only RLS — see supabase/migrations/0009_logbook.sql). Reconciliation
 *    is last-write-wins on `updated_at` keyed by `id`; deletes propagate via a
 *    pending-deletes list. (Single-user tool: simultaneous offline edits to the
 *    SAME case on two devices is an accepted rare edge case.)
 * ==========================================================================*/

const SUPABASE_URL = "https://drsamkdxsfrolzyvxsjb.supabase.co";
const PUBLISHABLE  = "sb_publishable_BxB2XjnPjFQ2yScmMJHbpA_T98Bv4Ag";
const OWNER_EMAIL  = "drbinsaad@gmail.com";
const REDIRECT_TO  = location.origin + location.pathname;

const FIELDS = ["case_date", "setting", "mrn", "age", "age_unit", "sex", "side",
  "diagnosis", "procedure", "surgeon_role", "asa", "findings", "outcome",
  "complication", "research_study", "enrolled", "consent", "followup_date",
  "followup_done", "status", "notes"];

const $ = (id) => document.getElementById(id);

let cases = [];        // in-memory rows for rendering (from the local store)
let editingId = null;
let sb = null;         // Supabase client (created on first sign-in attempt)
let signedIn = false;
let syncTimer = null;

/* =========================== IndexedDB (local) ============================ */
const DB_NAME = "ent-logbook";
const DB_VERSION = 1;
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("cases")) db.createObjectStore("cases", { keyPath: "id" });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "k" });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode) {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}
function reqP(r) {
  return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}

const Local = {
  async listAll() {
    const store = await tx("cases", "readonly");
    const rows = await reqP(store.getAll());
    rows.sort((a, b) =>
      (b.case_date || "").localeCompare(a.case_date || "") ||
      (b.updated_at || "").localeCompare(a.updated_at || ""));
    return rows;
  },
  async get(id) { return reqP((await tx("cases", "readonly")).get(id)); },
  async putRaw(row) { return reqP((await tx("cases", "readwrite")).put(row)); },
  async remove(id) { return reqP((await tx("cases", "readwrite")).delete(id)); },
  async metaGet(k, def) {
    const v = await reqP((await tx("meta", "readonly")).get(k));
    return v ? v.v : def;
  },
  async metaSet(k, v) { return reqP((await tx("meta", "readwrite")).put({ k: k, v: v })); },
  async addPendingDelete(id) {
    const list = await this.metaGet("pendingDeletes", []);
    if (list.indexOf(id) === -1) { list.push(id); await this.metaSet("pendingDeletes", list); }
  }
};

function nowISO() { return new Date().toISOString(); }
function cleanRow(src) {
  const r = { id: src.id, updated_at: src.updated_at };
  FIELDS.forEach((f) => { r[f] = src[f] == null ? null : src[f]; });
  return r;
}

/* ============================= Cloud (Supabase) ========================== */
function ensureClient() {
  if (sb) return sb;
  if (!window.supabase || !window.supabase.createClient) return null;
  sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE);
  return sb;
}

function isMissingTable(error) {
  const code = error && error.code ? error.code : "";
  const msg = (error && error.message ? error.message : "").toLowerCase();
  return code === "42P01" || code === "PGRST205" ||
    msg.includes("does not exist") || msg.includes("could not find the table");
}

const Cloud = {
  async pull() {
    const { data, error } = await sb.from("logbook").select("*");
    if (error) throw error;
    return (data || []).map(cleanRow);
  },
  async upsert(rows) {
    if (!rows.length) return;
    const { error } = await sb.from("logbook").upsert(rows.map(cleanRow), { onConflict: "id" });
    if (error) throw error;
  },
  async del(ids) {
    if (!ids.length) return;
    const { error } = await sb.from("logbook").delete().in("id", ids);
    if (error) throw error;
  }
};

/* ================================ Sync =================================== */
function scheduleSync() {
  if (!signedIn) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { fullSync().catch(() => {}); }, 800);
}

async function fullSync() {
  if (!signedIn || !sb) return;
  setSyncState("syncing");
  try {
    // 1) Flush pending deletes to the cloud.
    const pending = await Local.metaGet("pendingDeletes", []);
    if (pending.length) { await Cloud.del(pending); await Local.metaSet("pendingDeletes", []); }

    // 2) Pull cloud + read local, reconcile by id (last-write-wins).
    const cloudRows = await Cloud.pull();
    const localRows = await Local.listAll();
    const cloudMap = {}; cloudRows.forEach((r) => { cloudMap[r.id] = r; });
    const localMap = {}; localRows.forEach((r) => { localMap[r.id] = r; });
    const ids = {}; Object.keys(cloudMap).forEach((i) => ids[i] = 1); Object.keys(localMap).forEach((i) => ids[i] = 1);

    const toPush = [];
    for (const id in ids) {
      const c = cloudMap[id], l = localMap[id];
      if (l && !c) { toPush.push(l); }
      else if (c && !l) { await Local.putRaw(c); }
      else {
        const lt = Date.parse(l.updated_at || 0), ct = Date.parse(c.updated_at || 0);
        if (lt > ct) toPush.push(l);
        else if (ct > lt) await Local.putRaw(c);
      }
    }
    if (toPush.length) await Cloud.upsert(toPush);

    cases = await Local.listAll();
    renderAll();
    await Local.metaSet("lastSync", nowISO());
    setSyncState("synced");
  } catch (e) {
    if (isMissingTable(e)) {
      setSyncState("error", "Cloud not set up yet — run migration 0009_logbook.sql in Supabase. Your data is safe on this device.");
    } else {
      setSyncState("error", "Sync error: " + (e && e.message ? e.message : "unknown") + ". Data is safe on this device.");
    }
  }
}

/* ============================ Sync-bar UI ================================= */
function setSyncState(state, msg) {
  const dot = $("sync-dot"), text = $("sync-text"), m = $("sync-msg");
  dot.className = "dot";
  m.classList.add("is-hidden");
  if (state === "local") { text.textContent = "Saved on this device"; }
  else if (state === "syncing") { dot.classList.add("dot-syncing"); text.textContent = "Syncing…"; }
  else if (state === "synced") { dot.classList.add("dot-synced"); text.textContent = "Synced · " + OWNER_EMAIL; }
  else if (state === "error") {
    dot.classList.add("dot-error"); text.textContent = "Sync paused — saved on device";
    if (msg) { m.className = "callout callout-warn"; m.textContent = msg; m.classList.remove("is-hidden"); }
  }
  $("btn-sync").classList.toggle("is-hidden", signedIn);
  $("btn-signout").classList.toggle("is-hidden", !signedIn);
}

function flashMsg(text, kind) {
  const m = $("sync-msg");
  m.className = "callout callout-" + (kind || "info");
  m.textContent = text;
  m.classList.remove("is-hidden");
  setTimeout(() => m.classList.add("is-hidden"), 3500);
}

/* ============================ Auth handlers ============================== */
async function onSession(session) {
  if (!session) { signedIn = false; setSyncState("local"); return; }
  const email = (session.user && session.user.email ? session.user.email : "").toLowerCase();
  if (email !== OWNER_EMAIL) {
    signedIn = false;
    flashMsg("That account (" + (email || "unknown") + ") isn't the owner. Signed out — your on-device log is untouched.", "warn");
    try { await sb.auth.signOut(); } catch (e) {}
    setSyncState("local");
    return;
  }
  signedIn = true;
  setSyncState("synced");
  await fullSync();
}

/* ============================== helpers (render) ========================= */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function daysUntil(iso) {
  if (!iso) return null;
  const t = new Date(todayISO() + "T00:00:00");
  const d = new Date(iso + "T00:00:00");
  return Math.round((d - t) / 86400000);
}
function settingTag(s) {
  const cls = { OR: "or", Clinic: "clinic", Ward: "ward", ER: "er" }[s] || "";
  return `<span class="tag ${cls}">${esc(s || "—")}</span>`;
}
function ptLabel(c) {
  const bits = [];
  if (c.mrn) bits.push(esc(c.mrn));
  if (c.age != null && c.age !== "") bits.push(esc(c.age) + (c.age_unit === "months" ? "m" : "y"));
  if (c.sex) bits.push(esc(c.sex));
  return bits.join(" · ") || "—";
}

/* ------------------------------ rendering -------------------------------- */
function renderAll() {
  renderLog();
  renderFollowup();
  renderResearch();
  renderStats();
  const due = cases.filter((c) => c.followup_date && !c.followup_done).length;
  const enrolled = cases.filter((c) => c.enrolled).length;
  $("pill-followup").textContent = due;
  $("pill-research").textContent = enrolled;
  $("count-summary").textContent = `${cases.length} case${cases.length === 1 ? "" : "s"} logged`;
}

function filteredCases() {
  const q = $("q-search").value.trim().toLowerCase();
  const setting = $("q-setting").value;
  const status = $("q-status").value;
  return cases.filter((c) => {
    if (setting && c.setting !== setting) return false;
    if (status && c.status !== status) return false;
    if (q) {
      const hay = [c.mrn, c.diagnosis, c.procedure, c.research_study, c.findings, c.notes].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderLog() {
  const rows = filteredCases();
  const body = $("log-body");
  $("log-empty").classList.toggle("is-hidden", rows.length > 0);
  body.innerHTML = rows.map((c) => {
    let fu = "—";
    if (c.followup_date) {
      const d = daysUntil(c.followup_date);
      if (c.followup_done) fu = `<span class="tag study">done</span>`;
      else if (d < 0) fu = `<span class="tag overdue">${fmtDate(c.followup_date)}</span>`;
      else if (d <= 14) fu = `<span class="tag due">${fmtDate(c.followup_date)}</span>`;
      else fu = fmtDate(c.followup_date);
    }
    const study = c.research_study ? `<span class="tag study">${esc(c.research_study)}</span>` : "—";
    return `<tr>
      <td>${fmtDate(c.case_date)}</td>
      <td>${settingTag(c.setting)}</td>
      <td>${ptLabel(c)}</td>
      <td>${esc(c.diagnosis) || "—"}</td>
      <td>${esc(c.procedure) || "—"}</td>
      <td>${esc(c.surgeon_role) || "—"}</td>
      <td>${esc(c.outcome) || "—"}</td>
      <td>${study}</td>
      <td>${fu}</td>
      <td><div class="row-actions">
        <button class="icon-btn" data-edit="${c.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="icon-btn del" data-del="${c.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join("");
}

function renderFollowup() {
  const rows = cases.filter((c) => c.followup_date && !c.followup_done)
    .sort((a, b) => a.followup_date.localeCompare(b.followup_date));
  $("followup-empty").classList.toggle("is-hidden", rows.length > 0);
  $("followup-body").innerHTML = rows.map((c) => {
    const d = daysUntil(c.followup_date);
    let badge;
    if (d < 0) badge = `<span class="tag overdue">${Math.abs(d)}d overdue</span>`;
    else if (d === 0) badge = `<span class="tag overdue">today</span>`;
    else if (d <= 14) badge = `<span class="tag due">in ${d}d</span>`;
    else badge = `<span class="tag">in ${d}d</span>`;
    return `<tr>
      <td>${fmtDate(c.followup_date)}<br>${badge}</td>
      <td>${ptLabel(c)}</td>
      <td>${esc(c.diagnosis) || "—"}${c.procedure ? "<br><span style='color:#9a9488'>" + esc(c.procedure) + "</span>" : ""}</td>
      <td>${settingTag(c.setting)}</td>
      <td>${c.research_study ? '<span class="tag study">' + esc(c.research_study) + "</span>" : "—"}</td>
      <td>${esc(c.status)}</td>
      <td><div class="row-actions">
        <button class="icon-btn" data-done="${c.id}" title="Mark follow-up done"><i class="fas fa-check"></i></button>
        <button class="icon-btn" data-edit="${c.id}" title="Edit"><i class="fas fa-pen"></i></button>
      </div></td>
    </tr>`;
  }).join("");
}

function renderResearch() {
  const enrolled = cases.filter((c) => c.enrolled);
  $("research-empty").classList.toggle("is-hidden", enrolled.length > 0);
  const groups = {};
  enrolled.forEach((c) => { const k = c.research_study || "(unnamed study)"; (groups[k] = groups[k] || []).push(c); });
  const html = Object.keys(groups).sort().map((study) => {
    const list = groups[study];
    const consented = list.filter((c) => c.consent).length;
    const rows = list.map((c) => `<tr>
      <td>${fmtDate(c.case_date)}</td>
      <td>${ptLabel(c)}</td>
      <td>${esc(c.diagnosis) || "—"}</td>
      <td>${c.consent ? '<span class="tag study">consented</span>' : '<span class="tag overdue">no consent</span>'}</td>
      <td>${c.followup_date ? (c.followup_done ? '<span class="tag study">done</span>' : fmtDate(c.followup_date)) : "—"}</td>
      <td><button class="icon-btn" data-edit="${c.id}" title="Edit"><i class="fas fa-pen"></i></button></td>
    </tr>`).join("");
    return `<div style="margin-bottom:26px;">
      <h3 style="font-family:'Newsreader',serif;font-size:18px;color:#1c1a17;margin-bottom:4px;">${esc(study)}</h3>
      <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6f6a61;margin-bottom:10px;">${list.length} enrolled &middot; ${consented} consented</p>
      <div class="results-scroll"><table class="tbl" style="min-width:600px;">
        <thead><tr><th>Date</th><th>Pt</th><th>Diagnosis</th><th>Consent</th><th>Follow-up</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }).join("");
  $("research-groups").innerHTML = html;
}

function renderStats() {
  $("s-total").textContent = cases.length;
  $("s-or").textContent = cases.filter((c) => c.setting === "OR").length;
  $("s-primary").textContent = cases.filter((c) => c.surgeon_role === "Primary").length;
  $("s-enrolled").textContent = cases.filter((c) => c.enrolled).length;

  const bySetting = {};
  cases.forEach((c) => { bySetting[c.setting] = (bySetting[c.setting] || 0) + 1; });
  $("bars-setting").innerHTML = barRows(bySetting);

  const byProc = {};
  cases.forEach((c) => { const p = (c.procedure || "").trim(); if (p) byProc[p] = (byProc[p] || 0) + 1; });
  const procEntries = Object.entries(byProc).sort((a, b) => b[1] - a[1]).slice(0, 10);
  $("proc-empty").classList.toggle("is-hidden", procEntries.length > 0);
  const maxProc = procEntries.length ? procEntries[0][1] : 1;
  $("bars-procedure").innerHTML = procEntries.map(([k, v]) => barRow(k, v, maxProc)).join("");
}

function barRows(obj) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const max = entries.length ? entries[0][1] : 1;
  return entries.map(([k, v]) => barRow(k, v, max)).join("");
}
function barRow(label, val, max) {
  const pct = Math.round((val / max) * 100);
  return `<div class="bar-row"><span class="lab" title="${esc(label)}">${esc(label)}</span>
    <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
    <span class="val">${val}</span></div>`;
}

/* ------------------------------- form ------------------------------------ */
function readForm() {
  const numOrNull = (v) => (v === "" || v == null ? null : Number(v));
  const txt = (id) => $(id).value.trim() || null;
  return {
    case_date: $("f-case_date").value || todayISO(),
    setting: $("f-setting").value,
    mrn: txt("f-mrn"),
    age: numOrNull($("f-age").value),
    age_unit: $("f-age_unit").value,
    sex: $("f-sex").value || null,
    side: $("f-side").value || null,
    diagnosis: txt("f-diagnosis"),
    procedure: txt("f-procedure"),
    surgeon_role: $("f-surgeon_role").value || null,
    asa: $("f-asa").value || null,
    outcome: $("f-outcome").value || null,
    complication: txt("f-complication"),
    findings: txt("f-findings"),
    notes: txt("f-notes"),
    research_study: txt("f-research_study"),
    enrolled: $("f-enrolled").checked,
    consent: $("f-consent").checked,
    followup_date: $("f-followup_date").value || null,
    followup_done: $("f-followup_done").checked,
    status: $("f-status").value
  };
}

function fillForm(c) {
  $("f-id").value = c.id;
  $("f-case_date").value = c.case_date || todayISO();
  $("f-setting").value = c.setting || "OR";
  $("f-mrn").value = c.mrn || "";
  $("f-age").value = c.age == null ? "" : c.age;
  $("f-age_unit").value = c.age_unit || "years";
  $("f-sex").value = c.sex || "";
  $("f-side").value = c.side || "";
  $("f-diagnosis").value = c.diagnosis || "";
  $("f-procedure").value = c.procedure || "";
  $("f-surgeon_role").value = c.surgeon_role || "";
  $("f-asa").value = c.asa || "";
  $("f-outcome").value = c.outcome || "";
  $("f-complication").value = c.complication || "";
  $("f-findings").value = c.findings || "";
  $("f-notes").value = c.notes || "";
  $("f-research_study").value = c.research_study || "";
  $("f-enrolled").checked = !!c.enrolled;
  $("f-consent").checked = !!c.consent;
  $("f-followup_date").value = c.followup_date || "";
  $("f-followup_done").checked = !!c.followup_done;
  $("f-status").value = c.status || "active";
}

function resetForm() {
  $("case-form").reset();
  $("f-id").value = "";
  $("f-case_date").value = todayISO();
  $("f-setting").value = "OR";
  editingId = null;
  $("form-title").textContent = "Add a case";
  $("save-btn").innerHTML = '<i class="fas fa-floppy-disk"></i> Save case';
  $("cancel-edit").classList.add("is-hidden");
}

function startEdit(id) {
  const c = cases.find((x) => x.id === id);
  if (!c) return;
  editingId = id;
  fillForm(c);
  $("form-title").textContent = "Edit case";
  $("save-btn").innerHTML = '<i class="fas fa-floppy-disk"></i> Update case';
  $("cancel-edit").classList.remove("is-hidden");
  switchTab("log");
  $("case-form").scrollIntoView({ behavior: "smooth", block: "start" });
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function submitForm(e) {
  e.preventDefault();
  const payload = readForm();
  payload.id = editingId || newId();
  payload.updated_at = nowISO();

  const btn = $("save-btn"); btn.disabled = true;
  const original = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Saving…';
  const msg = $("form-msg"); msg.classList.add("is-hidden");

  try {
    await Local.putRaw(payload);
    msg.className = "callout callout-ok";
    msg.textContent = editingId ? "Case updated." : "Case saved.";
    msg.classList.remove("is-hidden");
    setTimeout(() => msg.classList.add("is-hidden"), 2500);
    resetForm();
    cases = await Local.listAll();
    renderAll();
    scheduleSync();
  } catch (err) {
    msg.className = "callout callout-warn";
    msg.textContent = "Save failed: " + (err && err.message ? err.message : "unknown error");
    msg.classList.remove("is-hidden");
  } finally {
    btn.disabled = false; btn.innerHTML = original;
  }
}

async function deleteCase(id) {
  const c = cases.find((x) => x.id === id);
  const label = c ? (c.procedure || c.diagnosis || c.mrn || "this case") : "this case";
  if (!confirm(`Delete the entry for "${label}"? This cannot be undone.`)) return;
  await Local.remove(id);
  await Local.addPendingDelete(id);
  cases = await Local.listAll();
  renderAll();
  scheduleSync();
}

async function markFollowupDone(id) {
  const c = await Local.get(id);
  if (!c) return;
  c.followup_done = true;
  c.updated_at = nowISO();
  await Local.putRaw(c);
  cases = await Local.listAll();
  renderAll();
  scheduleSync();
}

/* ------------------------------- export ---------------------------------- */
function exportCSV() {
  const rows = filteredCases();
  const cols = FIELDS.slice();
  const csvCell = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [cols.join(",")];
  rows.forEach((c) => lines.push(cols.map((k) => csvCell(c[k])).join(",")));
  download(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), `logbook-${todayISO()}.csv`);
}

function exportJSON() {
  const data = { type: "ent-logbook", version: 1, exported: nowISO(), cases: cases.map(cleanRow) };
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `logbook-backup-${todayISO()}.json`);
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : (data.cases || []);
    if (!rows.length) { flashMsg("No cases found in that file.", "warn"); return; }
    let added = 0;
    for (const raw of rows) {
      if (!raw || typeof raw !== "object") continue;
      const row = cleanRow(raw);
      if (!row.id) row.id = newId();
      if (!row.updated_at) row.updated_at = nowISO();
      // Merge: imported row wins only if newer than an existing one.
      const existing = await Local.get(row.id);
      if (!existing || Date.parse(row.updated_at) >= Date.parse(existing.updated_at || 0)) {
        await Local.putRaw(row); added++;
      }
    }
    cases = await Local.listAll();
    renderAll();
    flashMsg(`Imported ${added} case${added === 1 ? "" : "s"}.`, "ok");
    scheduleSync();
  } catch (e) {
    flashMsg("Import failed: " + (e && e.message ? e.message : "invalid file"), "warn");
  }
}

/* ------------------------------- tabs ------------------------------------ */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  ["log", "followup", "research", "stats"].forEach((n) =>
    $("tab-" + n).classList.toggle("is-hidden", n !== name));
}

/* ------------------------------- wiring ---------------------------------- */
async function wire() {
  // Load local data first so the app is usable immediately, offline, no login.
  try {
    cases = await Local.listAll();
  } catch (e) {
    cases = [];
    flashMsg("This browser blocked local storage (private mode?). Data won't persist.", "warn");
  }
  $("f-case_date").value = todayISO();
  setSyncState("local");
  renderAll();

  $("case-form").addEventListener("submit", submitForm);
  $("cancel-edit").addEventListener("click", resetForm);
  $("export-csv").addEventListener("click", exportCSV);
  $("btn-export-json").addEventListener("click", exportJSON);
  $("btn-import-json").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = "";
  });
  ["q-search", "q-setting", "q-status"].forEach((id) => $(id).addEventListener("input", renderLog));
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

  // Quick-add chips: start a fresh case pre-set to a setting, focus on MRN.
  document.querySelectorAll(".qa-chip").forEach((ch) => ch.addEventListener("click", () => {
    resetForm();
    $("f-setting").value = ch.getAttribute("data-qa");
    $("f-case_date").value = todayISO();
    switchTab("log");
    $("case-form").scrollIntoView({ behavior: "smooth", block: "start" });
    $("f-mrn").focus();
  }));

  document.addEventListener("click", (e) => {
    const ed = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    const done = e.target.closest("[data-done]");
    if (ed) startEdit(ed.getAttribute("data-edit"));
    else if (del) deleteCase(del.getAttribute("data-del"));
    else if (done) markFollowupDone(done.getAttribute("data-done"));
  });

  // Sign in to sync
  $("btn-sync").addEventListener("click", async () => {
    const client = ensureClient();
    if (!client) { flashMsg("Couldn't load the sign-in library. Check your connection.", "warn"); return; }
    const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: REDIRECT_TO } });
    if (error) flashMsg(error.message || "Sign-in failed.", "warn");
  });
  document.querySelectorAll("[data-signout]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (sb) { try { await sb.auth.signOut(); } catch (e) {} }
      signedIn = false;
      setSyncState("local");
      flashMsg("Signed out. Your log stays on this device.", "info");
    }));

  // Pick up an existing Supabase session (e.g. after the OAuth redirect).
  const client = ensureClient();
  if (client) {
    client.auth.onAuthStateChange((_evt, session) => onSession(session));
    client.auth.getSession().then((res) => { if (res.data && res.data.session) onSession(res.data.session); });
  }
}

document.addEventListener("DOMContentLoaded", wire);
