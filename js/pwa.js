/* ============================================================================
 * PWA bootstrap — registers the service worker and brokers the install prompt.
 * Include on any page with: <script src="/js/pwa.js" defer></script>
 *
 * Install button (optional): give an element id="pwa-install" (hidden by
 * default). This script shows it when the browser offers installation and
 * triggers the native prompt on click. On iOS (no prompt API) it shows a hint
 * element id="pwa-ios-hint" instead.
 * ==========================================================================*/
(function () {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function (err) {
        // Non-fatal: the site still works without offline support.
        console.warn("Service worker registration failed:", err);
      });
    });
  }

  var deferredPrompt = null;

  function show(el) { if (el) el.classList.remove("is-hidden"); }
  function hide(el) { if (el) el.classList.add("is-hidden"); }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
           window.navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    show(document.getElementById("pwa-install"));
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hide(document.getElementById("pwa-install"));
  });

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("pwa-install");
    if (btn) {
      btn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () {
          deferredPrompt = null;
          hide(btn);
        });
      });
    }
    // iOS has no install prompt API — surface the manual "Share → Add to Home
    // Screen" hint instead, only when not already installed.
    if (isIOS() && !isStandalone()) {
      show(document.getElementById("pwa-ios-hint"));
    }
  });
})();
