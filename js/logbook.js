/* ============================================================================
 * Consultant Logbook (logbook.html)
 * Owner-only, de-identified case log with research-cohort + follow-up tracking.
 *
 * Security model: Google sign-in via Supabase Auth. The owner-email check here
 * is only for UX — the real boundary is Postgres Row Level Security (see
 * supabase/migrations/0009_logbook.sql), which lets ONLY the owner's JWT read
 * or write rows. The publishable key alone can read nothing.
 * ==========================================================================*/

const SUPABASE_URL = "https://drsamkdxsfrolzyvxsjb.supabase.co";
const PUBLISHABLE  = "sb_publishable_BxB2XjnPjFQ2yScmMJHbpA_T98Bv4Ag";
const OWNER_EMAIL  = "drbinsaad@gmail.com";
const REDIRECT_TO  = location.origin + location.pathname; // works on shahrani.me and github.io

const $ = (id) => document.getElementById(id);

let sb = null;
let cases = [];          // all rows for the owner
let editingId = null;

/* ----------------------------- gate / session ---------------------------- */
function showState(id) {
  ["gate-loading", "gate-signin", "gate-denied", "gate-setup", "view-app"].forEach((s) => {
    const el = $(s);
    if (el) el.classList.toggle("is-hidden", s !== id);
  });
  window.scrollTo(0, 0);
}

async function onSession(session) {
  if (!session) { showState("gate-signin"); return; }
  const email = (session.user && session.user.email ? session.user.email : "").toLowerCase();
  if (email !== OWNER_EMAIL) {
    $("denied-email").textContent = email || "(unknown)";
    showState("gate-denied");
    return;
  }
  $("owner-email").textContent = email;
  await loadCases();
}

async function loadCases() {
  const { data, error } = await sb
    .from("logbook")
    .select("*")
    .order("case_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    // 42P01 = table missing; PGRST205 = schema cache miss for unknown table.
    const code = error.code || "";
    const msg = (error.message || "").toLowerCase();
    if (code === "42P01" || code === "PGRST205" || msg.includes("does not exist") || msg.includes("could not find the table")) {
      $("setup-detail").textContent = "Details: " + (error.message || code);
      showState("gate-setup");
      return;
    }
    showState("gate-signin");
    $("signin-error").textContent = "Could not load the logbook: " + (error.message || "unknown error");
    $("signin-error").classList.remove("is-hidden");
    return;
  }

  cases = data || [];
  showState("view-app");
  renderAll();
}

/* ------------------------------ helpers ---------------------------------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function todayISO() {
  // Local date (not UTC) so "today" matches the clinician's calendar.
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
      const hay = [c.mrn, c.diagnosis, c.procedure, c.research_study, c.findings, c.notes]
        .join(" ").toLowerCase();
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
    const study = c.research_study
      ? `<span class="tag study">${esc(c.research_study)}</span>` : "—";
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
  const rows = cases
    .filter((c) => c.followup_date && !c.followup_done)
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
  enrolled.forEach((c) => {
    const k = c.research_study || "(unnamed study)";
    (groups[k] = groups[k] || []).push(c);
  });
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
  $("bars-setting").innerHTML = barRows(bySetting, cases.length);

  const byProc = {};
  cases.forEach((c) => {
    const p = (c.procedure || "").trim();
    if (p) byProc[p] = (byProc[p] || 0) + 1;
  });
  const procEntries = Object.entries(byProc).sort((a, b) => b[1] - a[1]).slice(0, 10);
  $("proc-empty").classList.toggle("is-hidden", procEntries.length > 0);
  const maxProc = procEntries.length ? procEntries[0][1] : 1;
  $("bars-procedure").innerHTML = procEntries.map(([k, v]) => barRow(k, v, maxProc)).join("");
}

function barRows(obj, total) {
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
    status: $("f-status").value,
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

async function submitForm(e) {
  e.preventDefault();
  const payload = readForm();
  const btn = $("save-btn");
  btn.disabled = true;
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Saving…';
  const msg = $("form-msg");
  msg.classList.add("is-hidden");

  let error;
  if (editingId) {
    ({ error } = await sb.from("logbook").update(payload).eq("id", editingId));
  } else {
    ({ error } = await sb.from("logbook").insert(payload));
  }

  btn.disabled = false;
  btn.innerHTML = original;

  if (error) {
    msg.className = "callout callout-warn";
    msg.textContent = "Save failed: " + (error.message || "unknown error");
    msg.classList.remove("is-hidden");
    return;
  }

  msg.className = "callout callout-ok";
  msg.textContent = editingId ? "Case updated." : "Case saved.";
  msg.classList.remove("is-hidden");
  setTimeout(() => msg.classList.add("is-hidden"), 2500);
  resetForm();
  await loadCases();
}

async function deleteCase(id) {
  const c = cases.find((x) => x.id === id);
  const label = c ? (c.procedure || c.diagnosis || c.mrn || "this case") : "this case";
  if (!confirm(`Delete the entry for "${label}"? This cannot be undone.`)) return;
  const { error } = await sb.from("logbook").delete().eq("id", id);
  if (error) { alert("Delete failed: " + (error.message || "unknown error")); return; }
  await loadCases();
}

async function markFollowupDone(id) {
  const { error } = await sb.from("logbook").update({ followup_done: true }).eq("id", id);
  if (error) { alert("Update failed: " + (error.message || "unknown error")); return; }
  await loadCases();
}

/* ------------------------------- export ---------------------------------- */
function exportCSV() {
  const rows = filteredCases();
  const cols = ["case_date", "setting", "mrn", "age", "age_unit", "sex", "side",
    "diagnosis", "procedure", "surgeon_role", "asa", "outcome", "complication",
    "findings", "research_study", "enrolled", "consent", "followup_date",
    "followup_done", "status", "notes"];
  const csvCell = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [cols.join(",")];
  rows.forEach((c) => lines.push(cols.map((k) => csvCell(c[k])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `logbook-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------- tabs ------------------------------------ */
function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === name));
  ["log", "followup", "research", "stats"].forEach((n) =>
    $("tab-" + n).classList.toggle("is-hidden", n !== name));
}

/* ------------------------------- wiring ---------------------------------- */
function wire() {
  if (!window.supabase || !window.supabase.createClient) {
    showState("gate-signin");
    $("signin-error").textContent = "Could not load the sign-in library. Check your connection and reload.";
    $("signin-error").classList.remove("is-hidden");
    return;
  }
  sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE);
  $("f-case_date").value = todayISO();

  $("btn-google").addEventListener("click", async () => {
    $("signin-error").classList.add("is-hidden");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_TO },
    });
    if (error) {
      $("signin-error").textContent = error.message || "Sign-in failed. Is the Google provider enabled in Supabase?";
      $("signin-error").classList.remove("is-hidden");
    }
  });

  document.querySelectorAll("[data-signout]").forEach((b) =>
    b.addEventListener("click", async () => {
      await sb.auth.signOut();
      cases = [];
      showState("gate-signin");
    }));

  $("case-form").addEventListener("submit", submitForm);
  $("cancel-edit").addEventListener("click", resetForm);
  $("export-csv").addEventListener("click", exportCSV);
  ["q-search", "q-setting", "q-status"].forEach((id) =>
    $(id).addEventListener("input", renderLog));

  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => switchTab(t.dataset.tab)));

  // Delegated row actions across all tables.
  document.addEventListener("click", (e) => {
    const ed = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    const done = e.target.closest("[data-done]");
    if (ed) startEdit(ed.getAttribute("data-edit"));
    else if (del) deleteCase(del.getAttribute("data-del"));
    else if (done) markFollowupDone(done.getAttribute("data-done"));
  });

  sb.auth.onAuthStateChange((_evt, session) => onSession(session));
  sb.auth.getSession().then((res) => onSession(res.data ? res.data.session : null));
}

document.addEventListener("DOMContentLoaded", wire);
