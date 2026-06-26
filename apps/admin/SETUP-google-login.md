# Owner Admin — Google Login Setup

`admin.html` is the owner-only admin area for `shahrani.me`. It signs you in
with **Google** (restricted to **drbinsaad@gmail.com**) and then shows the Exam
Hub control panel. The owner check is enforced **on the server** (the Edge
Function verifies your Google token), so the page can't be bypassed.

Examiners are unaffected — they still log in with their number codes on
`exam-hub.html`.

There is **one manual step only you can do**: create a Google OAuth credential.
Everything else (enabling it in Supabase, deploying the code) Claude does for
you once you hand over the Client ID + secret and a Supabase access token.

---

## Step 1 — Create the Google OAuth credential (you, ~5 min)

1. Go to <https://console.cloud.google.com/> (sign in as **drbinsaad@gmail.com**).
2. Create or select any project (e.g. "Shahrani Site").
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create.
   - App name: e.g. "Shahrani Admin"; user support email: **drbinsaad@gmail.com**;
     developer contact email: **drbinsaad@gmail.com**. Save and continue.
   - Scopes: skip (the defaults email/profile/openid are enough). Continue.
   - **Test users → Add users → drbinsaad@gmail.com.** Continue. (Leaving the app
     in "Testing" mode is fine — only listed test users can sign in, an extra guard.)
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: e.g. "shahrani.me admin".
   - **Authorized redirect URIs → Add URI**, paste exactly:
     ```
     https://drsamkdxsfrolzyvxsjb.supabase.co/auth/v1/callback
     ```
   - Create. Copy the **Client ID** and **Client secret**.
5. Send Claude the **Client ID + Client secret** and a **Supabase personal access
   token** (Supabase Dashboard → Account → Access Tokens → generate). Claude does
   the rest. *(The client secret is sensitive — it goes only into Supabase, never
   into the website. You can revoke the access token once setup is confirmed.)*

## Step 2 — Enable Google in Supabase (Claude, via API)

Claude sends a single `PATCH` to the Management API:
```
PATCH https://api.supabase.com/v1/projects/drsamkdxsfrolzyvxsjb/config/auth
{ "site_url": "https://shahrani.me",
  "uri_allow_list": "https://shahrani.me/admin.html,https://shahrani.me/**",
  "external_google_enabled": true,
  "external_google_client_id": "<CLIENT_ID>",
  "external_google_secret": "<CLIENT_SECRET>" }
```
(Manual alternative: Supabase Dashboard → Authentication → Providers → Google
→ enable + paste ID/secret; and Authentication → URL Configuration → set Site URL
and add the redirect URLs above.)

## Step 3 — Use it

1. Open `https://shahrani.me/admin.html`.
2. Click **Continue with Google**, pick **drbinsaad@gmail.com**.
3. You land on **Exam Control**: set the exam title/max, the 6 examiner codes, the
   6 resident names, watch results, and download Excel.
4. Any other Google account → "Not the owner account" (and the server refuses too).

## How the security works

- The owner email is checked **in the Edge Function**: it validates the Google
  session token (`getUser`) and only acts if the email is `drbinsaad@gmail.com`.
  A non-owner with a real Google login, or a forged token, is rejected server-side
  — the data never leaves Supabase.
- The page only ships the **public** publishable key (safe). The Google **client
  secret** and Supabase **service key** never touch the website.
- To change the owner email later, set an `OWNER_EMAIL` env var on the Edge
  Function (or edit the constant) and redeploy.

## Break-glass fallback

The number **admin passcode** still opens the admin screen on `exam-hub.html`
(it shares the same panel). Keep it private — it's the backup route if Google
sign-in is ever unavailable. You can change it from the admin screen
(Exam Setup → Admin Passcode).
