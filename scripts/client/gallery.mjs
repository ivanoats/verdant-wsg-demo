// Gallery motion previews: deferred, DOM-dependent, and bounded to a finite
// run so the loading specimens never animate indefinitely.
import {
  skeletonNarrowCss, skeletonNarrowPreviewCss, skeletonWideCss,
  skeletonWidePreviewCss, spinnerCss, spinnerPreviewCss,
} from '../pages/components.mjs'

export const motionPreviewJs = `(function () {
  var btn = document.getElementById("motion-preview");
  if (!btn) return;
  var status = document.getElementById("motion-preview-status");
  var spinnerEl = document.getElementById("demo-spinner");
  var skeletonWideEl = document.getElementById("demo-skeleton-wide");
  var skeletonNarrowEl = document.getElementById("demo-skeleton-narrow");
  var media = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var timer = 0;
  function setStatus(text) {
    if (status) status.textContent = text;
  }
  function setStatic() {
    if (spinnerEl) spinnerEl.className = ${JSON.stringify(spinnerCss)};
    if (skeletonWideEl) skeletonWideEl.className = ${JSON.stringify(skeletonWideCss)};
    if (skeletonNarrowEl) skeletonNarrowEl.className = ${JSON.stringify(skeletonNarrowCss)};
  }
  function restartAnimation(el, className) {
    if (!el) return;
    el.className = className.static;
    void el.offsetWidth;
    el.className = className.preview;
  }
  function syncReducedMotionStatus() {
    window.clearTimeout(timer);
    setStatic();
    if (media && media.matches) {
      setStatus("Reduced motion is enabled, so the loading preview stays still.");
      return true;
    }
    setStatus("Static by default. Preview runs once, then stops automatically.");
    return false;
  }
  btn.addEventListener("click", function () {
    if (syncReducedMotionStatus()) return;
    restartAnimation(spinnerEl, { static: ${JSON.stringify(spinnerCss)}, preview: ${JSON.stringify(spinnerPreviewCss)} });
    restartAnimation(skeletonWideEl, { static: ${JSON.stringify(skeletonWideCss)}, preview: ${JSON.stringify(skeletonWidePreviewCss)} });
    restartAnimation(skeletonNarrowEl, { static: ${JSON.stringify(skeletonNarrowCss)}, preview: ${JSON.stringify(skeletonNarrowPreviewCss)} });
    setStatus("Preview running for about four seconds. It stops automatically.");
    timer = window.setTimeout(function () {
      setStatic();
      setStatus("Preview finished. Loading demos are static again.");
    }, 4200);
  });
  if (media) {
    if (media.addEventListener) {
      media.addEventListener("change", syncReducedMotionStatus);
    } else if (media.addListener) {
      media.addListener(syncReducedMotionStatus);
    }
  }
  syncReducedMotionStatus();
})();
`
