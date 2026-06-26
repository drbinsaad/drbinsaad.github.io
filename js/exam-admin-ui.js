/* ============================================================================
 * ENT Exam Hub — shared admin UI
 * One implementation of the exam-admin screen (config editor + results grid +
 * Excel export), used by BOTH:
 *   - exam-hub.html  (admin via the number passcode, break-glass fallback)
 *   - admin.html     (admin via Google sign-in; owner verified server-side)
 *
 * The transport is INJECTED as `api(action, payload)` so each page supplies its
 * own auth (passcode-in-body vs Google JWT-in-header). This module never
 * touches page-level session state or view switching — the caller shows the
 * #view-admin section, then calls the returned enterAdmin(config).
 *
 * Requires the #view-admin markup (see exam-hub.html / admin.html) and SheetJS.
 * ==========================================================================*/
window.ExamAdminUI = function initExamAdmin(opts) {
  opts = opts || {};
  var api = opts.api;
  var onConfigSaved = opts.onConfigSaved || function () {}; // (newAdminCode) => void

  var STATIONS = ["Otology", "Rhinology", "General", "General 2", "Pediatric", "Head & Neck"];
  var RESIDENT_IDS = ["R1", "R2", "R3", "R4", "R5", "R6"];
  var lastResults = null;

  /* --- local helpers (scoped; no globals, so no clash with exam-hub.js) --- */
  function $(id) { return document.getElementById(id); }
  function setMsg(id, text, kind) {
    var el = $(id); if (!el) return;
    el.textContent = text;
    el.className = "callout callout-" + (kind || "info") + (text ? "" : " is-hidden");
  }
  function busy(btn, on, idleHtml) {
    if (!btn) return;
    if (on) { btn.dataset.idle = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true; }
    else { btn.innerHTML = idleHtml || btn.dataset.idle || btn.innerHTML; btn.disabled = false; }
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function round1(n) { return Math.round(Number(n) * 10) / 10; }

  /* ------------------------------ config editor ------------------------- */
  function enterAdmin(config) {
    config = config || {};
    $("cfg-title").value = config.examTitle || "";
    $("cfg-max").value = config.scoreMax || 100;
    $("cfg-admincode").value = config.adminCode || "";

    var exWrap = $("cfg-examiners");
    exWrap.innerHTML = "";
    var exMap = {};
    (config.examiners || []).forEach(function (e) { exMap[e.station] = e.passcode; });
    STATIONS.forEach(function (st) {
      var row = document.createElement("div");
      row.className = "config-row";
      row.innerHTML =
        '<label>' + escapeHtml(st) + '</label>' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" ' +
          'data-station="' + escapeHtml(st) + '" value="' + escapeHtml(exMap[st] != null ? String(exMap[st]) : "") + '" placeholder="code">';
      exWrap.appendChild(row);
    });

    var resWrap = $("cfg-residents");
    resWrap.innerHTML = "";
    var resMap = {};
    (config.residents || []).forEach(function (r) { resMap[r.residentId] = r.name; });
    RESIDENT_IDS.forEach(function (rid) {
      var row = document.createElement("div");
      row.className = "config-row";
      row.style.gridTemplateColumns = "70px minmax(0,1fr)";
      row.innerHTML =
        '<label>' + rid + '</label>' +
        '<input type="text" data-rid="' + rid + '" value="' + escapeHtml(resMap[rid] || "") + '" placeholder="Resident name">';
      resWrap.appendChild(row);
    });

    setMsg("admin-config-msg", "", "info");
    setMsg("admin-results-msg", "", "info");
    refreshResults();
  }

  async function saveConfig(btn) {
    var examTitle = $("cfg-title").value.trim();
    var scoreMax = Number($("cfg-max").value);
    var adminCode = $("cfg-admincode").value.trim();

    if (!examTitle) { setMsg("admin-config-msg", "Enter an exam title.", "warn"); return; }
    if (isNaN(scoreMax) || scoreMax < 1) { setMsg("admin-config-msg", "Maximum score must be a positive number.", "warn"); return; }
    if (!adminCode) { setMsg("admin-config-msg", "Set an admin passcode.", "warn"); return; }

    var examiners = [];
    document.querySelectorAll("#cfg-examiners input[data-station]").forEach(function (i) {
      examiners.push({ station: i.getAttribute("data-station"), passcode: i.value.trim() });
    });
    var residents = [];
    document.querySelectorAll("#cfg-residents input[data-rid]").forEach(function (i) {
      residents.push({ residentId: i.getAttribute("data-rid"), name: i.value.trim() });
    });

    var codes = examiners.filter(function (e) { return e.passcode; }).map(function (e) { return e.passcode; });
    if (new Set(codes).size !== codes.length) { setMsg("admin-config-msg", "Examiner passcodes must be unique.", "warn"); return; }
    if (codes.indexOf(adminCode) !== -1) { setMsg("admin-config-msg", "The admin passcode must differ from every examiner code.", "warn"); return; }

    busy(btn, true);
    var r = await api("saveConfig", {
      examTitle: examTitle, scoreMax: scoreMax,
      adminCode: adminCode, examiners: examiners, residents: residents
    });
    busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save configuration');
    if (!r.ok) { setMsg("admin-config-msg", r.error || "Could not save configuration.", "warn"); return; }

    onConfigSaved(adminCode);
    setMsg("admin-config-msg", "Configuration saved.", "ok");
    refreshResults();
  }

  /* -------------------------------- results ----------------------------- */
  async function refreshResults(btn) {
    if (btn) busy(btn, true);
    setMsg("admin-results-msg", "Loading…", "info");
    var r = await api("getResults", {});
    if (btn) busy(btn, false, '<i class="fas fa-rotate"></i> Refresh results');
    if (!r.ok) { setMsg("admin-results-msg", r.error || "Could not load results.", "warn"); $("admin-results-wrap").classList.add("is-hidden"); return; }
    lastResults = r;
    renderResults(r);
    setMsg("admin-results-msg", "", "info");
  }

  function renderResults(r) {
    var stations = r.stations && r.stations.length ? r.stations : STATIONS;
    var residents = r.residents || [];
    var grid = r.grid || {};
    var stats = r.stats || { perResident: {}, perStation: {} };

    if (!residents.length) {
      $("admin-results-wrap").classList.add("is-hidden");
      setMsg("admin-results-msg", "No residents configured yet — add them in Exam Setup above.", "info");
      return;
    }

    var html = "<thead><tr><th class='r-head'>Resident</th>";
    stations.forEach(function (st) { html += "<th>" + escapeHtml(st) + "</th>"; });
    html += "<th>Total</th><th>Average</th></tr></thead><tbody>";

    residents.forEach(function (res) {
      var row = grid[res.residentId] || {};
      html += "<tr><td class='r-head'>" + escapeHtml(res.name || res.residentId) + "</td>";
      stations.forEach(function (st) {
        var cell = row[st];
        if (cell && cell.score != null && cell.score !== "") {
          html += "<td><span class='cell-score'>" + escapeHtml(String(cell.score)) + "</span></td>";
        } else {
          html += "<td class='empty'>—</td>";
        }
      });
      var ps = stats.perResident[res.residentId] || {};
      html += "<td class='total'>" + (ps.total != null ? ps.total : "—") + "</td>";
      html += "<td class='total'>" + (ps.average != null ? round1(ps.average) : "—") + "</td>";
      html += "</tr>";
    });

    html += "<tr class='station-avg'><td class='r-head'>Station average</td>";
    stations.forEach(function (st) {
      var ss = stats.perStation[st] || {};
      html += "<td>" + (ss.average != null ? round1(ss.average) : "—") + "</td>";
    });
    html += "<td></td><td></td></tr></tbody>";

    $("admin-results-table").innerHTML = html;
    $("admin-results-wrap").classList.remove("is-hidden");
  }

  /* ----------------------------- Excel export --------------------------- */
  function exportXlsx() {
    if (!lastResults || !(lastResults.residents || []).length) {
      setMsg("admin-results-msg", "Nothing to export yet — refresh results first.", "warn");
      return;
    }
    if (typeof XLSX === "undefined") {
      setMsg("admin-results-msg", "Excel library failed to load. Check your connection and retry.", "warn");
      return;
    }
    var r = lastResults;
    var stations = r.stations && r.stations.length ? r.stations : STATIONS;
    var residents = r.residents || [];
    var grid = r.grid || {};
    var stats = r.stats || { perResident: {}, perStation: {} };

    var aoa = [];
    aoa.push([r.examTitle || "ENT Exam"]);
    aoa.push(["Exported", new Date().toLocaleString()]);
    aoa.push([]);
    aoa.push(["Resident"].concat(stations).concat(["Total", "Average"]));

    residents.forEach(function (res) {
      var row = grid[res.residentId] || {};
      var line = [res.name || res.residentId];
      stations.forEach(function (st) {
        var cell = row[st];
        line.push(cell && cell.score != null && cell.score !== "" ? cell.score : "");
      });
      var ps = stats.perResident[res.residentId] || {};
      line.push(ps.total != null ? ps.total : "");
      line.push(ps.average != null ? round1(ps.average) : "");
      aoa.push(line);
    });

    var avgLine = ["Station average"];
    stations.forEach(function (st) {
      var ss = stats.perStation[st] || {};
      avgLine.push(ss.average != null ? round1(ss.average) : "");
    });
    avgLine.push("", "");
    aoa.push(avgLine);

    var ws = XLSX.utils.aoa_to_sheet(aoa);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    var safe = (r.examTitle || "ENT-Exam").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    XLSX.writeFile(wb, safe + "-results.xlsx");
  }

  /* ------------------------------- wiring ------------------------------- */
  var sc = $("admin-save-config"); if (sc) sc.addEventListener("click", function () { saveConfig(this); });
  var rf = $("admin-refresh");     if (rf) rf.addEventListener("click", function () { refreshResults(this); });
  var ex = $("admin-export-xlsx"); if (ex) ex.addEventListener("click", exportXlsx);

  return { enterAdmin: enterAdmin, refreshResults: refreshResults };
};
