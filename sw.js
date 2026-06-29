/* ============================================================================
 * Service worker — Alshahrani ENT "Clinic Companion" PWA
 *
 * Strategy:
 *  - Precache the app shell (core pages/assets) so the app opens instantly and
 *    works with no internet. Missing files are skipped, not fatal.
 *  - Runtime: stale-while-revalidate for same-origin pages and trusted CDNs
 *    (fonts, Font Awesome, supabase-js, SheetJS) — instant from cache, refreshed
 *    in the background.
 *  - Supabase API calls (auth + data) BYPASS the worker entirely — never cache
 *    patient data or auth tokens.
 *
 * Bump CACHE_VERSION to force clients onto new cached assets.
 * ==========================================================================*/

const CACHE_VERSION = "v1";
const PRECACHE = "ent-precache-" + CACHE_VERSION;
const RUNTIME  = "ent-runtime-" + CACHE_VERSION;

// App shell. Files that don't exist yet are skipped (allSettled), so this list
// can name pages added in later phases without breaking installation.
const SHELL = [
  "/",
  "/clinic.html",
  "/ent-tools.html",
  "/drug-tools.html",
  "/logbook.html",
  "/sore-throat.html",
  "/bppv-vertigo.html",
  "/js/pwa.js",
  "/js/logbook.js",
  "/manifest.webmanifest",
  "/favicon.png",
  "/apps/ent-tools/assets/icon.png"
];

const CDN_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      // Add each entry independently so one 404 doesn't abort the whole install.
      Promise.allSettled(SHELL.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isCacheableCrossOrigin(url) {
  return CDN_HOSTS.indexOf(url.hostname) !== -1;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // mutations always go to the network

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Never intercept Supabase (auth + patient data): always live network.
  if (url.hostname.indexOf("supabase.") !== -1) return;

  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isCacheableCrossOrigin(url)) return; // leave other hosts alone

  event.respondWith(staleWhileRevalidate(req, url));
});

async function staleWhileRevalidate(req, url) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);

  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);

  if (cached) return cached;

  const fresh = await network;
  if (fresh) return fresh;

  // Offline and uncached: for page navigations, fall back to the launcher.
  if (req.mode === "navigate") {
    const shell = await caches.match("/clinic.html");
    if (shell) return shell;
  }
  return new Response("Offline and not cached yet.", {
    status: 503,
    headers: { "Content-Type": "text/plain" }
  });
}
