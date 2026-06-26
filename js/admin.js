/* ============================================================================
 * Owner Admin (admin.html) — Google sign-in gate
 * Signs the owner in with Google via Supabase Auth, then shows the shared
 * exam-admin UI (js/exam-admin-ui.js). The owner email is checked here for UX
 * AND enforced server-side by the Edge Function (which verifies the Google
 * JWT) — the UI guard alone is not the security boundary.
 * ==========================================================================*/

const SUPABASE_URL  = "https://drsamkdxsfrolzyvxsjb.supabase.co";
const PUBLISHABLE   = "sb_publishable_BxB2XjnPjFQ2yScmMJHbpA_T98Bv4Ag";
const OWNER_EMAIL   = "drbinsaad@gmail.com";
const EXAM_FN_URL   = SUPABASE_URL + "/functions/v1/exam-hub";
const REDIRECT_TO   = "https://shahrani.me/admin.html";

const $ = function (id) { return document.getElementById(id); };

let sb = null;
let accessToken = null;
let adminUi = null;

/* JWT-authenticated transport handed to the shared admin UI. Sends the Google
 * session token (NOT the anon key) so the function can verify the owner. */
async function api(action, payload) {
  try {
    const res = await fetch(EXAM_FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": PUBLISHABLE,
        "Authorization": "Bearer " + (accessToken || "")
      },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    const t = await res.text();
    try { return JSON.parse(t); }
    catch (e) { return { ok: false, error: "Unexpected server response." }; }
  } catch (e) {
    return { ok: false, error: "Network error. If the exam isn't running, the database may be paused — check Supabase." };
  }
}

function showState(id) {
  ["gate-loading", "gate-signin", "gate-denied", "view-admin"].forEach(function (s) {
    $(s).classList.toggle("is-hidden", s !== id);
  });
  window.scrollTo(0, 0);
}

async function onSession(session) {
  if (!session) { showState("gate-signin"); return; }
  accessToken = session.access_token;
  const email = (session.user && session.user.email ? session.user.email : "").toLowerCase();

  if (email !== OWNER_EMAIL) {
    $("denied-email").textContent = email || "(unknown)";
    showState("gate-denied");
    return;
  }

  // Server-side confirmation (the real gate): function verifies the JWT + email.
  const who = await api("whoami", {});
  if (!who.ok || !who.owner) {
    $("denied-email").textContent = email;
    showState("gate-denied");
    return;
  }

  $("owner-email").textContent = email;
  if (!adminUi) adminUi = window.ExamAdminUI({ api: api });
  showState("view-admin");
  adminUi.enterAdmin(who.config || {});
}

function wire() {
  if (!window.supabase || !window.supabase.createClient) {
    showState("gate-signin");
    $("signin-error").textContent = "Could not load the sign-in library. Check your connection and reload.";
    $("signin-error").classList.remove("is-hidden");
    return;
  }
  sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE);

  $("btn-google").addEventListener("click", async function () {
    $("signin-error").classList.add("is-hidden");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_TO }
    });
    if (error) {
      $("signin-error").textContent = error.message || "Sign-in failed. Is the Google provider enabled in Supabase?";
      $("signin-error").classList.remove("is-hidden");
    }
  });

  document.querySelectorAll("[data-signout]").forEach(function (b) {
    b.addEventListener("click", async function () {
      await sb.auth.signOut();
      accessToken = null;
      showState("gate-signin");
    });
  });

  // React to sign-in / sign-out / token refresh, and pick up the OAuth redirect.
  sb.auth.onAuthStateChange(function (_evt, session) { onSession(session); });
  sb.auth.getSession().then(function (res) { onSession(res.data ? res.data.session : null); });
}

document.addEventListener("DOMContentLoaded", wire);
