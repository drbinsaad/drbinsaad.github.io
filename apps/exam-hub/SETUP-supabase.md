# ENT Exam Hub — Backend (Supabase)

The Exam Hub stores its data in **Supabase** (a free, hosted Postgres database)
and reaches it through a small **Edge Function** that checks the passcodes. The
website (`/exam-hub.html` + `/js/exam-hub.js`) talks to that function directly.

Project: **drbinsaad's Project** — `https://drsamkdxsfrolzyvxsjb.supabase.co`

> Claude set this up for you. This doc explains how it works, how to run it
> again, and the few things to remember. You don't normally need to touch any
> of it.

## What was created

- **Database tables** (`supabase/migrations/0001_exam_hub.sql`):
  `exam_setup` (title, max score, admin code), `exam_examiners` (station +
  passcode), `exam_residents` (R1–R6 + names), `exam_grades` (one row per
  station × resident). Row-Level Security is **on with no policies**, so the
  public key can't read or write the tables — only the function can.
- **Edge Function** `exam-hub` (`supabase/functions/exam-hub/index.ts`): the
  only thing allowed to touch the data. It validates the number passcode and
  then reads/writes using the secret service key (which never leaves the
  server).
- **Frontend wiring** (`js/exam-hub.js`): holds only the project URL and the
  public key (safe to publish).

Default codes (change them anytime from the Admin screen): admin **9999**;
examiners **1001** Otology, **1002** Rhinology, **1003** General, **1004**
General 2, **1005** Pediatric, **1006** Head & Neck.

## Day-to-day use

1. Go to `https://shahrani.me/exam-hub.html`.
2. Log in with **9999** → set the exam title, max score, the 6 examiner codes,
   and the 6 resident names → **Save configuration**.
3. Give each examiner their number. They log in on their own phone and score
   the residents.
4. You log in as admin → **Refresh results** to watch the grid fill in →
   **Download Excel** when done.

## ⚠️ Important: free projects pause when idle

Supabase **pauses a free project after about 7 days with no activity**, and it
does **not** wake up on its own. **The day before each exam, log into
<https://supabase.com/dashboard>, open the project, and click _Restore/Resume_
if it shows as paused.** Give it a minute to come back, then do a quick login
test on the site.

(Optional: a weekly automated ping can keep it awake — ask Claude to add a
GitHub Action if you'd like that.)

## Security notes

- Number-only passcodes are **light** protection — fine for a closed exam among
  known people, **not** for patient-identifiable data. Share the link and codes
  privately and change the codes after each exam.
- The **publishable/anon key** in `js/exam-hub.js` is meant to be public; it
  can't read the data on its own (RLS blocks it).
- The **service key** and your **personal access token** are secret. They are
  never committed to the website. If you shared an access token with Claude to
  do the setup, you can safely **revoke it** now at
  Dashboard → Account → Access Tokens (the site keeps working without it).

## Re-deploying the backend (for a developer)

With the Supabase CLI and a personal access token (no Docker needed):

```bash
export SUPABASE_ACCESS_TOKEN=...        # from Dashboard > Account > Access Tokens
npx supabase@latest link --project-ref drsamkdxsfrolzyvxsjb
npx supabase@latest db push                               # apply migrations
npx supabase@latest functions deploy exam-hub --use-api   # deploy the function
```

The migration can also be run by pasting `0001_exam_hub.sql` into the
dashboard **SQL Editor**, and the function by pasting `index.ts` into
**Edge Functions** (then turn **Verify JWT** off). The service key is injected
automatically — there are no secrets to set.
