/**
 * ENT Exam Hub — Google Apps Script backend
 * ------------------------------------------------------------------------
 * Deploy this as a Web App bound to a Google Sheet. The Sheet IS the data
 * store and the admin's "Excel sheet". The static front end (exam-hub.html +
 * js/exam-hub.js on shahrani.me) calls this over fetch.
 *
 * SETUP: see apps/exam-hub/SETUP.md. In short:
 *   1. Create a Google Sheet, Extensions > Apps Script, paste this file.
 *   2. Run initSheet() once (creates the 4 tabs + default codes).
 *   3. Deploy > New deployment > Web app:
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the /exec URL into EXAM_API_URL in js/exam-hub.js.
 *   5. After ANY edit here: Deploy > Manage deployments > Edit > New version.
 *
 * CORS: the front end POSTs with Content-Type text/plain (a "simple request")
 * so the browser sends no preflight. We never set response headers; an
 * "Anyone" web-app response already carries Access-Control-Allow-Origin: *.
 * Every handler returns JSON and never throws (an uncaught throw would yield
 * an HTML error page that breaks the client's JSON.parse).
 * ========================================================================*/

var TAB_SETUP     = 'Setup';
var TAB_EXAMINERS = 'Examiners';
var TAB_RESIDENTS = 'Residents';
var TAB_GRADES    = 'Grades';

var STATIONS    = ['Otology', 'Rhinology', 'General', 'General 2', 'Pediatric', 'Head & Neck'];
var RESIDENT_IDS = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

/* ----------------------------- entry points ----------------------------- */
function doPost(e) {
  var out;
  try {
    var body = JSON.parse(e.postData.contents);
    out = route_(body);
  } catch (err) {
    out = { ok: false, error: 'Server error: ' + (err && err.message ? err.message : err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'ENT Exam Hub', hint: 'POST actions only.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function route_(body) {
  switch (body.action) {
    case 'validateCode': return validateCode_(body);
    case 'submitGrade':  return submitGrade_(body);
    case 'saveConfig':   return saveConfig_(body);
    case 'getResults':   return getResults_(body);
    default:             return { ok: false, error: 'Unknown action.' };
  }
}

/* ------------------------------- actions -------------------------------- */

// validateCode {code} -> resolves the passcode to a role.
function validateCode_(body) {
  var code = normCode_(body.code);
  if (!code) return { ok: false, error: 'Enter a passcode.' };
  var setup = readSetup_();

  if (code === normCode_(setup.adminCode)) {
    return {
      ok: true, role: 'admin',
      config: {
        examTitle: setup.examTitle,
        scoreMax: setup.scoreMax,
        adminCode: setup.adminCode,
        examiners: readExaminers_(),
        residents: readResidents_()
      }
    };
  }

  var station = stationForCode_(code);
  if (station) {
    return {
      ok: true, role: 'examiner', station: station,
      config: {
        examTitle: setup.examTitle,
        scoreMax: setup.scoreMax,
        residents: readResidents_(),
        myGrades: gradesForStation_(station)
      }
    };
  }
  return { ok: false, error: 'Invalid passcode.' };
}

// submitGrade {code, residentId, score, notes} -> upsert one cell (examiner only).
function submitGrade_(body) {
  var code = normCode_(body.code);
  var station = stationForCode_(code);
  if (!station) return { ok: false, error: 'Invalid passcode.' };

  var residentId = String(body.residentId || '').trim();
  if (RESIDENT_IDS.indexOf(residentId) === -1) return { ok: false, error: 'Unknown resident.' };

  var setup = readSetup_();
  var score = Number(body.score);
  if (isNaN(score) || score < 0 || score > Number(setup.scoreMax)) {
    return { ok: false, error: 'Score must be between 0 and ' + setup.scoreMax + '.' };
  }
  var notes = String(body.notes || '');
  var ts = new Date();

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var sh = sheet_(TAB_GRADES);
    var values = sh.getDataRange().getValues(); // includes header row
    var rowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === station && String(values[i][1]) === residentId) { rowIndex = i + 1; break; }
    }
    var rowData = [station, residentId, score, notes, ts, station];
    if (rowIndex > 0) {
      sh.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sh.appendRow(rowData);
    }
  } catch (err) {
    return { ok: false, error: 'Could not save (busy). Try again.' };
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
  return { ok: true, saved: { residentId: residentId, score: score, notes: notes } };
}

// saveConfig {code, examTitle, scoreMax, adminCode, examiners[], residents[]} -> admin only.
function saveConfig_(body) {
  var setup = readSetup_();
  if (normCode_(body.code) !== normCode_(setup.adminCode)) return { ok: false, error: 'Admin passcode required.' };

  var examTitle = String(body.examTitle || '').trim();
  var scoreMax = Number(body.scoreMax);
  var adminCode = normCode_(body.adminCode);
  if (!examTitle) return { ok: false, error: 'Exam title is required.' };
  if (isNaN(scoreMax) || scoreMax < 1) return { ok: false, error: 'Maximum score must be a positive number.' };
  if (!adminCode) return { ok: false, error: 'Admin passcode is required.' };

  var examiners = (body.examiners || []).map(function (e) {
    return { station: String(e.station || '').trim(), passcode: normCode_(e.passcode) };
  });
  var residents = (body.residents || []).map(function (r) {
    return { residentId: String(r.residentId || '').trim(), name: String(r.name || '').trim() };
  });

  // uniqueness / collision checks
  var codes = examiners.filter(function (e) { return e.passcode; }).map(function (e) { return e.passcode; });
  var seen = {};
  for (var i = 0; i < codes.length; i++) {
    if (seen[codes[i]]) return { ok: false, error: 'Examiner passcodes must be unique.' };
    seen[codes[i]] = true;
  }
  if (codes.indexOf(adminCode) !== -1) return { ok: false, error: 'Admin passcode must differ from every examiner code.' };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    // Setup
    var su = sheet_(TAB_SETUP);
    su.getRange(1, 1, 1, 3).setValues([['examTitle', 'scoreMax', 'adminCode']]);
    su.getRange(2, 1, 1, 3).setValues([[examTitle, scoreMax, adminCode]]);

    // Examiners (fixed station order)
    var ex = sheet_(TAB_EXAMINERS);
    ex.clear();
    ex.getRange(1, 1, 1, 2).setValues([['station', 'passcode']]);
    var exRows = STATIONS.map(function (st) {
      var match = examiners.filter(function (e) { return e.station === st; })[0];
      return [st, match ? match.passcode : ''];
    });
    ex.getRange(2, 1, exRows.length, 2).setValues(exRows);

    // Residents (fixed ids R1..R6); NOTE: never touches Grades, so renames keep scores
    var rs = sheet_(TAB_RESIDENTS);
    rs.clear();
    rs.getRange(1, 1, 1, 2).setValues([['residentId', 'name']]);
    var resRows = RESIDENT_IDS.map(function (rid) {
      var match = residents.filter(function (r) { return r.residentId === rid; })[0];
      return [rid, match ? match.name : ''];
    });
    rs.getRange(2, 1, resRows.length, 2).setValues(resRows);
  } catch (err) {
    return { ok: false, error: 'Could not save configuration (busy). Try again.' };
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
  return { ok: true };
}

// getResults {code} -> admin only; full grid + server-computed stats.
function getResults_(body) {
  var setup = readSetup_();
  if (normCode_(body.code) !== normCode_(setup.adminCode)) return { ok: false, error: 'Admin passcode required.' };

  var residents = readResidents_().filter(function (r) { return r.name; });
  var examiners = readExaminers_();
  var stations = examiners.map(function (e) { return e.station; });
  if (!stations.length) stations = STATIONS.slice();

  var grades = readGrades_();
  var grid = {}, perResident = {}, perStation = {};
  residents.forEach(function (r) { grid[r.residentId] = {}; });
  stations.forEach(function (st) { perStation[st] = { sum: 0, count: 0 }; });

  grades.forEach(function (g) {
    if (!grid[g.residentId]) grid[g.residentId] = {};
    grid[g.residentId][g.station] = { score: g.score, notes: g.notes };
    if (perStation[g.station]) { perStation[g.station].sum += g.score; perStation[g.station].count++; }
  });

  residents.forEach(function (r) {
    var sum = 0, count = 0;
    stations.forEach(function (st) {
      var c = grid[r.residentId][st];
      if (c && c.score != null && c.score !== '') { sum += Number(c.score); count++; }
    });
    perResident[r.residentId] = { total: count ? sum : null, average: count ? sum / count : null, count: count };
  });

  var perStationOut = {};
  stations.forEach(function (st) {
    var s = perStation[st];
    perStationOut[st] = { average: s.count ? s.sum / s.count : null, count: s.count };
  });

  return {
    ok: true,
    examTitle: setup.examTitle,
    scoreMax: setup.scoreMax,
    stations: stations,
    residents: residents,
    grid: grid,
    stats: { perResident: perResident, perStation: perStationOut }
  };
}

/* ------------------------------- readers -------------------------------- */
function readSetup_() {
  var sh = sheet_(TAB_SETUP);
  var v = sh.getRange(2, 1, 1, 3).getValues()[0];
  return { examTitle: v[0] || '', scoreMax: v[1] || 100, adminCode: v[2] || '' };
}
function readExaminers_() {
  var sh = sheet_(TAB_EXAMINERS);
  var v = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim()) out.push({ station: String(v[i][0]).trim(), passcode: v[i][1] != null ? String(v[i][1]).trim() : '' });
  }
  return out;
}
function readResidents_() {
  var sh = sheet_(TAB_RESIDENTS);
  var v = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim()) out.push({ residentId: String(v[i][0]).trim(), name: String(v[i][1] || '').trim() });
  }
  return out;
}
function readGrades_() {
  var sh = sheet_(TAB_GRADES);
  var v = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim()) {
      out.push({ station: String(v[i][0]).trim(), residentId: String(v[i][1]).trim(), score: Number(v[i][2]), notes: String(v[i][3] || '') });
    }
  }
  return out;
}
function gradesForStation_(station) {
  return readGrades_().filter(function (g) { return g.station === station; })
    .map(function (g) { return { residentId: g.residentId, score: g.score, notes: g.notes }; });
}
function stationForCode_(code) {
  code = normCode_(code);
  if (!code) return null;
  var ex = readExaminers_();
  for (var i = 0; i < ex.length; i++) {
    if (ex[i].passcode && normCode_(ex[i].passcode) === code) return ex[i].station;
  }
  return null;
}

/* ------------------------------- helpers -------------------------------- */
function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}
// Normalise codes to plain digit strings so 1001, "1001", 1001.0 all match.
function normCode_(c) {
  if (c == null) return '';
  var s = String(c).trim();
  if (s === '') return '';
  if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, ''); // Sheets may store as float
  return s;
}

/* --------------------- one-time initialiser (run once) ------------------ */
function initSheet() {
  var su = sheet_(TAB_SETUP);
  su.clear();
  su.getRange(1, 1, 1, 3).setValues([['examTitle', 'scoreMax', 'adminCode']]);
  su.getRange(2, 1, 1, 3).setValues([['AFHSR ENT OSCE', 100, '9999']]);

  var ex = sheet_(TAB_EXAMINERS);
  ex.clear();
  ex.getRange(1, 1, 1, 2).setValues([['station', 'passcode']]);
  var exRows = STATIONS.map(function (st, i) { return [st, String(1001 + i)]; });
  ex.getRange(2, 1, exRows.length, 2).setValues(exRows);

  var rs = sheet_(TAB_RESIDENTS);
  rs.clear();
  rs.getRange(1, 1, 1, 2).setValues([['residentId', 'name']]);
  var resRows = RESIDENT_IDS.map(function (rid) { return [rid, '']; });
  rs.getRange(2, 1, resRows.length, 2).setValues(resRows);

  var gr = sheet_(TAB_GRADES);
  gr.clear();
  gr.getRange(1, 1, 1, 6).setValues([['station', 'residentId', 'score', 'notes', 'timestamp', 'examiner']]);

  SpreadsheetApp.getActiveSpreadsheet().toast('Exam Hub tabs initialised. Admin code 9999, examiner codes 1001–1006.');
}
