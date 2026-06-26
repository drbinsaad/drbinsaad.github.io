# ENT Exam Hub — Setup Guide

This folder holds the **backend** for the Exam Hub. The front end lives in
`/exam-hub.html` + `/js/exam-hub.js` and is served by the website. The backend
is a small **Google Apps Script** tied to a **Google Sheet you own** — that
Sheet is your live "Excel sheet" of results.

> These files (`Code.gs`, `appsscript.json`) are **not** run by the website.
> They are the source you paste into Google. They live here only for version
> history.

You do the Google steps **once**. Budget ~10 minutes.

---

## Step 1 — Create the Sheet + script

1. Go to <https://sheets.google.com> and create a new blank spreadsheet.
   Name it e.g. **"ENT Exam Hub"**.
2. In the menu: **Extensions → Apps Script**. A code editor opens.
3. Delete the sample `function myFunction() {}`.
4. Open `Code.gs` from this folder, copy **everything**, and paste it into the
   Apps Script editor. Click the **Save** (💾) icon.

## Step 2 — Build the tabs (one click)

1. In the Apps Script editor, in the function dropdown at the top, choose
   **`initSheet`**, then click **Run**.
2. The first time, Google asks you to **authorize**. Allow it (it's your own
   script acting on your own sheet).
3. Switch back to the Sheet — you'll now have four tabs: **Setup, Examiners,
   Residents, Grades**, pre-filled with:
   - Admin passcode: **9999**
   - Examiner passcodes: **1001** Otology, **1002** Rhinology, **1003**
     General, **1004** General 2, **1005** Pediatric, **1006** Head & Neck
   - Max score: **100**

   (You can change all of these later from the Admin screen on the website.)

## Step 3 — Publish as a Web App

1. In the Apps Script editor: **Deploy → New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Set:
   - **Description**: `Exam Hub`
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**  ← important. Do **NOT** pick "Anyone with
     Google account" — that forces a Google login and breaks the website.
4. Click **Deploy**, authorize if asked, then **copy the Web app URL**. It ends
   in `/exec` and looks like:
   `https://script.google.com/macros/s/AKfyc..................../exec`

## Step 4 — Connect the website to it

1. Open `/js/exam-hub.js` in the repository.
2. Paste your URL into the first line:
   ```js
   const EXAM_API_URL = "https://script.google.com/macros/s/AKfyc..../exec";
   ```
3. (Optional) Paste your Sheet's address into `SHEET_URL` so the admin
   "Open Google Sheet" button works:
   ```js
   const SHEET_URL = "https://docs.google.com/spreadsheets/d/..../edit";
   ```
4. Commit & push. Once GitHub Pages rebuilds, visit
   `https://shahrani.me/exam-hub.html`.

> Tell Claude the `/exec` URL and it can paste it in for you.

## Step 5 — Smoke test (do this first)

1. Open `https://shahrani.me/exam-hub.html`, type the admin code **9999**,
   press Enter. You should land on the **Exam Control** screen. If you instead
   see an error, the URL or deployment access is wrong — recheck Step 3.
2. In **Exam Setup**, type the 6 resident names, adjust codes/title if you
   like, and click **Save configuration**.
3. Open a private/incognito window, go to the same page, log in with an
   examiner code (e.g. **1003** = General). Enter scores, click **Save**.
4. Back on the admin screen, click **Refresh results** — the grid fills in.
   Click **Download Excel** to get the `.xlsx`.

---

## Editing the code later (important gotcha)

If you ever change `Code.gs`, the live website keeps using the OLD version
until you redeploy. To publish changes **at the same URL**:

**Deploy → Manage deployments → (pencil/Edit) → Version: New version → Deploy.**

(Do *not* create a brand-new deployment — that gives a different URL you'd have
to paste again.)

## How grading is stored

The **Grades** tab holds one row per station × resident (max 36 rows). When an
examiner saves a resident again, that same row is **updated** — no duplicates.
Resident names join by a fixed id (`R1`–`R6`), so renaming a resident never
loses their scores.

## Security notes (please read)

- Number-only passcodes are **light** access control: short, no rate limiting,
  no real accounts. That's acceptable for a **closed internal exam** among
  known people. **Do not** use this for patient-identifiable data.
- Share the link and the passcodes **privately**, and **rotate** the codes
  after each exam (just change them on the Admin screen and Save).
- Passcodes are only ever checked on the Google side — they are **not** stored
  in the public website files.
- Keep the Google Sheet's own sharing **private** (don't make the spreadsheet
  itself "anyone with the link can edit").
