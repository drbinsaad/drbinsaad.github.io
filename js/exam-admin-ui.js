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

  var STATIONS = ["Otology", "Rhinology", "Rhinology 2", "General", "General 2", "Pediatric", "Head & Neck"];
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

    var clrSel = $("admin-clear-resident");
    if (clrSel) {
      clrSel.innerHTML = "";
      RESIDENT_IDS.forEach(function (rid) {
        var o = document.createElement("option");
        o.value = rid; o.textContent = resMap[rid] ? resMap[rid] : rid;
        clrSel.appendChild(o);
      });
    }

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
          var nt = cell.notes ? escapeHtml(cell.notes) : "";
          html += "<td" + (nt ? " title='" + nt + "'" : "") + "><span class='cell-score'>" + escapeHtml(String(cell.score)) + "</span>" +
            (nt ? " <span class='note-dot' title='" + nt + "'>&#9679;</span>" : "") + "</td>";
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

    // Second sheet: examiner notes written during the exam (one row per scored cell that has a note).
    var notesAoa = [["Resident", "Station", "Score", "Examiner notes"]];
    residents.forEach(function (res) {
      var nrow = grid[res.residentId] || {};
      stations.forEach(function (st) {
        var c = nrow[st];
        if (c && c.notes && String(c.notes).trim()) {
          notesAoa.push([res.name || res.residentId, st, c.score != null ? c.score : "", String(c.notes)]);
        }
      });
    });
    if (notesAoa.length > 1) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notesAoa), "Notes");
    }
    var safe = (r.examTitle || "ENT-Exam").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    XLSX.writeFile(wb, safe + "-results.xlsx");
  }

  /* --------------------------- question editor -------------------------- */
  // In-memory model: [{ questionId, prompt, points:[{text,marks}], images:[] }].
  // A question with no scored points is a 0-mark case stem. Marks live in the
  // answer text as "(N marks)"; we split them out for editing and rejoin on save.
  var qe = { station: null, scoreMax: 100, questions: [] };

  function qeSplit(modelAnswers) {
    return (modelAnswers || []).map(function (m) {
      var mk = String(m).match(/\((\d+(?:\.\d+)?)\s*marks?\)\s*$/);
      return mk ? { text: String(m).slice(0, mk.index).trim(), marks: parseFloat(mk[1]) }
                : { text: String(m), marks: 0 };
    });
  }
  function qeJoin(p) {
    var t = (p.text || "").trim(); var m = Number(p.marks) || 0;
    if (!t) return "";
    return m ? t + " (" + (Math.round(m * 100) / 100) + " mark" + (m === 1 ? "" : "s") + ")" : t;
  }
  function qeInit() {
    var sel = $("qe-station");
    if (sel && !sel.options.length) {
      STATIONS.forEach(function (st) { var o = document.createElement("option"); o.value = st; o.textContent = st; sel.appendChild(o); });
    }
  }
  async function qeLoad(btn) {
    var station = $("qe-station").value;
    busy(btn, true);
    var r = await api("getQuestions", { station: station });
    busy(btn, false, '<i class="fas fa-rotate"></i> Load station');
    if (!r.ok) { setMsg("qe-msg", r.error || "Could not load.", "warn"); return; }
    qe.station = station; qe.scoreMax = Number(r.scoreMax) || 100;
    qe.questions = (r.questions || []).map(function (q) {
      return { questionId: q.questionId, prompt: q.prompt, points: qeSplit(q.modelAnswers), images: (q.images || []).slice() };
    });
    $("qe-max").textContent = qe.scoreMax;
    setMsg("qe-msg", "", "info");
    qeRender();
  }
  function qeRender() {
    var list = $("qe-list"); if (!list) return;
    var html = "";
    qe.questions.forEach(function (q, qi) {
      var pts = "";
      q.points.forEach(function (p, pi) {
        pts += '<div class="qe-point">' +
          '<textarea data-qi="' + qi + '" data-pi="' + pi + '" data-f="ptext" placeholder="Answer point the resident should say">' + escapeHtml(p.text) + '</textarea>' +
          '<input class="qe-mk" type="number" min="0" step="0.5" data-qi="' + qi + '" data-pi="' + pi + '" data-f="pmark" value="' + (p.marks || "") + '" placeholder="0">' +
          '<button class="qe-x" data-act="rmpt" data-qi="' + qi + '" data-pi="' + pi + '" title="Remove point">&times;</button></div>';
      });
      var imgs = "";
      q.images.forEach(function (src, ii) {
        var isVid = /\.(mp4|webm|mov|m4v)$/i.test(src);
        imgs += '<div class="qe-img">' +
          (isVid ? '<span class="qe-thumb qe-thumb-v">&#9654;</span>' : '<img class="qe-thumb" src="' + escapeHtml(src) + '" alt="">') +
          '<input type="text" data-qi="' + qi + '" data-ii="' + ii + '" data-f="img" value="' + escapeHtml(src) + '">' +
          '<button class="qe-x" data-act="rmimg" data-qi="' + qi + '" data-ii="' + ii + '" title="Remove image">&times;</button></div>';
      });
      var qtot = q.points.reduce(function (s, p) { return s + (Number(p.marks) || 0); }, 0);
      html += '<div class="qe-q"><div class="qe-q-head">' +
          '<span class="qe-q-id">' + escapeHtml(q.questionId || ("Q" + qi)) + '</span>' +
          '<button class="qe-mini" data-act="up" data-qi="' + qi + '" title="Move up">&uarr;</button>' +
          '<button class="qe-mini" data-act="down" data-qi="' + qi + '" title="Move down">&darr;</button>' +
          '<span class="qe-q-sub">' + (Math.round(qtot * 10) / 10) + ' marks</span>' +
          '<button class="qe-x" data-act="rmq" data-qi="' + qi + '" title="Remove question">&times;</button></div>' +
        '<textarea class="qe-prompt" data-qi="' + qi + '" data-f="prompt" placeholder="Question text (leave answer points empty for a 0-mark case stem)">' + escapeHtml(q.prompt) + '</textarea>' +
        '<div class="qe-points">' + pts + '<button class="qe-mini" data-act="addpt" data-qi="' + qi + '"><i class="fas fa-plus"></i> Add answer point</button></div>' +
        '<div class="qe-imgs">' + imgs + '<button class="qe-mini" data-act="addimg" data-qi="' + qi + '"><i class="fas fa-link"></i> Add image URL</button> ' +
          '<label class="qe-mini"><i class="fas fa-upload"></i> Upload image<input type="file" accept="image/*" data-act="upload" data-qi="' + qi + '" style="display:none"></label></div></div>';
    });
    list.innerHTML = html;
    $("qe-foot").classList.remove("is-hidden");
    qeBind(); qeRecompute();
  }
  function qeBind() {
    var list = $("qe-list");
    list.querySelectorAll("[data-f]").forEach(function (el) {
      el.addEventListener("input", function () {
        var qi = +el.getAttribute("data-qi"), f = el.getAttribute("data-f"), q = qe.questions[qi];
        if (f === "prompt") q.prompt = el.value;
        else if (f === "ptext") q.points[+el.getAttribute("data-pi")].text = el.value;
        else if (f === "pmark") { q.points[+el.getAttribute("data-pi")].marks = el.value === "" ? 0 : parseFloat(el.value); qeRecompute(); el.closest(".qe-q").querySelector(".qe-q-sub").textContent = (Math.round(q.points.reduce(function (s, p) { return s + (Number(p.marks) || 0); }, 0) * 10) / 10) + " marks"; }
        else if (f === "img") q.images[+el.getAttribute("data-ii")] = el.value;
      });
    });
    list.querySelectorAll("[data-act]").forEach(function (el) {
      var act = el.getAttribute("data-act");
      if (act === "upload") { el.addEventListener("change", function () { qeUpload(+el.getAttribute("data-qi"), el); }); return; }
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var qi = +el.getAttribute("data-qi"), a = qe.questions;
        if (act === "rmq") a.splice(qi, 1);
        else if (act === "addpt") a[qi].points.push({ text: "", marks: 1 });
        else if (act === "rmpt") a[qi].points.splice(+el.getAttribute("data-pi"), 1);
        else if (act === "addimg") a[qi].images.push("");
        else if (act === "rmimg") a[qi].images.splice(+el.getAttribute("data-ii"), 1);
        else if (act === "up" && qi > 0) { var t = a[qi - 1]; a[qi - 1] = a[qi]; a[qi] = t; }
        else if (act === "down" && qi < a.length - 1) { var u = a[qi + 1]; a[qi + 1] = a[qi]; a[qi] = u; }
        else return;
        qeRender();
      });
    });
  }
  function qeRecompute() {
    var total = 0;
    qe.questions.forEach(function (q) { q.points.forEach(function (p) { total += Number(p.marks) || 0; }); });
    total = Math.round(total * 10) / 10;
    var el = $("qe-total"); if (el) el.textContent = total;
    var wrap = $("qe-total-wrap"); var ok = Math.abs(total - Number(qe.scoreMax || 100)) < 0.05;
    if (wrap) { wrap.classList.toggle("good", ok); wrap.classList.toggle("bad", !ok); }
    var save = $("qe-save"); if (save) save.disabled = !ok;
  }
  function qeAddQuestion() {
    qe.questions.push({ questionId: "Q" + Date.now(), prompt: "", points: [{ text: "", marks: 1 }], images: [] });
    qeRender();
  }
  async function qeUpload(qi, input) {
    var file = input.files && input.files[0]; if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setMsg("qe-msg", "Image too large (max 4 MB).", "warn"); input.value = ""; return; }
    setMsg("qe-msg", "Uploading " + file.name + "…", "info");
    try {
      var b64 = await new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(",")[1]); }; fr.onerror = rej; fr.readAsDataURL(file); });
      var r = await api("uploadImage", { filename: file.name, contentType: file.type || "image/jpeg", dataBase64: b64 });
      input.value = "";
      if (!r.ok) { setMsg("qe-msg", r.error || "Upload failed.", "warn"); return; }
      qe.questions[qi].images.push(r.url);
      setMsg("qe-msg", "Image uploaded.", "ok"); qeRender();
    } catch (e) { setMsg("qe-msg", "Upload failed.", "warn"); }
  }
  async function qeSave(btn) {
    var total = 0; qe.questions.forEach(function (q) { q.points.forEach(function (p) { total += Number(p.marks) || 0; }); });
    if (Math.abs(Math.round(total * 10) / 10 - Number(qe.scoreMax || 100)) > 0.05) { setMsg("qe-msg", "Total must equal " + (qe.scoreMax || 100) + " before saving (now " + (Math.round(total * 10) / 10) + ").", "warn"); return; }
    var payload = qe.questions.map(function (q) {
      return { questionId: q.questionId, prompt: q.prompt, modelAnswers: q.points.map(qeJoin).filter(function (s) { return s.trim(); }), images: q.images.filter(function (s) { return s && s.trim(); }) };
    });
    busy(btn, true);
    var r = await api("saveQuestions", { station: qe.station, questions: payload });
    busy(btn, false, '<i class="fas fa-floppy-disk"></i> Save station');
    if (!r.ok) { setMsg("qe-msg", r.error || "Could not save.", "warn"); return; }
    setMsg("qe-msg", "Saved " + r.station + " — " + r.count + " questions, total " + r.total + ".", "ok");
  }

  /* ------------------------- clear results (trial) ---------------------- */
  async function clearOne(btn) {
    var sel = $("admin-clear-resident"); if (!sel || !sel.value) return;
    var rid = sel.value;
    var name = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : rid;
    if (!window.confirm("Clear ALL results for " + name + "? This cannot be undone.")) return;
    busy(btn, true);
    var r = await api("clearGrades", { residentId: rid });
    busy(btn, false, '<i class="fas fa-eraser"></i> Clear selected');
    if (!r.ok) { setMsg("admin-results-msg", r.error || "Could not clear results.", "warn"); return; }
    setMsg("admin-results-msg", "Cleared results for " + name + ".", "ok");
    refreshResults();
  }
  async function clearAll(btn) {
    if (!window.confirm("Clear ALL results for ALL residents? This wipes every score and cannot be undone.")) return;
    busy(btn, true);
    var r = await api("clearGrades", { residentId: "all" });
    busy(btn, false, '<i class="fas fa-trash"></i> Clear all results');
    if (!r.ok) { setMsg("admin-results-msg", r.error || "Could not clear results.", "warn"); return; }
    setMsg("admin-results-msg", "All results cleared.", "ok");
    refreshResults();
  }

  /* ------------------------------- wiring ------------------------------- */
  var c1 = $("admin-clear-one"); if (c1) c1.addEventListener("click", function () { clearOne(this); });
  var c2 = $("admin-clear-all"); if (c2) c2.addEventListener("click", function () { clearAll(this); });
  var sc = $("admin-save-config"); if (sc) sc.addEventListener("click", function () { saveConfig(this); });
  var rf = $("admin-refresh");     if (rf) rf.addEventListener("click", function () { refreshResults(this); });
  var ex = $("admin-export-xlsx"); if (ex) ex.addEventListener("click", exportXlsx);
  qeInit();
  var ql = $("qe-load"); if (ql) ql.addEventListener("click", function () { qeLoad(this); });
  var qa = $("qe-addq"); if (qa) qa.addEventListener("click", qeAddQuestion);
  var qs = $("qe-save"); if (qs) qs.addEventListener("click", function () { qeSave(this); });

  return { enterAdmin: enterAdmin, refreshResults: refreshResults };
};
