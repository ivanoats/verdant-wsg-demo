// Verdant theme runtime. Load this synchronously in <head>, before the
// stylesheet, so the stored preference is applied before first paint and there
// is no flash of the wrong theme.
//
// The preset's globalCss keys off data-theme-override, so without this script a
// page gets prefers-color-scheme only and an explicit Light/Dark choice cannot
// take effect. See docs/INSTALL.md.
//
// The constants below mirror src/theme.mjs; tests/theme-contract.test.mjs
// fails the build if the two ever drift apart.
(function () {
  var STORAGE_KEY = "verdant-theme-preference";
  var OVERRIDE_ATTR = "data-theme-override";
  var PREFERENCE_ATTR = "data-theme-preference";
  var RESOLVED_ATTR = "data-theme-resolved";
  var CONTROL_NAME = "theme-preference";
  var THEME_COLOR = { light: "#faf8f3", dark: "#15140f" };
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function systemTheme() {
    return media && media.matches ? "dark" : "light";
  }
  function readPreference() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return "system";
  }
  function persistPreference(value) {
    try {
      if (value === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }
  // Browser chrome follows the resolved theme: an explicit choice pins every
  // theme-color meta to that theme; System restores the media-query fallbacks.
  function syncThemeColor(value, resolved) {
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i += 1) {
      var meta = metas[i];
      if (!meta.hasAttribute("data-media")) {
        meta.setAttribute("data-media", meta.getAttribute("media") || "");
        meta.setAttribute("data-content", meta.getAttribute("content") || "");
      }
      if (value === "system") {
        meta.setAttribute("media", meta.getAttribute("data-media"));
        meta.setAttribute("content", meta.getAttribute("data-content"));
      } else {
        meta.removeAttribute("media");
        meta.setAttribute("content", THEME_COLOR[resolved]);
      }
    }
  }
  function applyPreference(value) {
    var resolved = value === "system" ? systemTheme() : value;
    var root = document.documentElement;
    root.setAttribute(PREFERENCE_ATTR, value);
    root.setAttribute(RESOLVED_ATTR, resolved);
    if (value === "system") root.removeAttribute(OVERRIDE_ATTR);
    else root.setAttribute(OVERRIDE_ATTR, value);
    syncThemeColor(value, resolved);
    return resolved;
  }
  function syncControls() {
    var radios = document.querySelectorAll('input[name="' + CONTROL_NAME + '"]');
    for (var i = 0; i < radios.length; i += 1) radios[i].checked = radios[i].value === currentPreference;
  }
  var currentPreference = readPreference();
  applyPreference(currentPreference);
  document.addEventListener("DOMContentLoaded", function () {
    syncControls();
    var radios = document.querySelectorAll('input[name="' + CONTROL_NAME + '"]');
    for (var i = 0; i < radios.length; i += 1) {
      radios[i].addEventListener("change", function (event) {
        currentPreference = event.target.value;
        persistPreference(currentPreference);
        applyPreference(currentPreference);
      });
    }
  });
  // A page restored from the back/forward cache keeps its old DOM state:
  // re-read the stored choice in case it changed on another page meanwhile.
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    currentPreference = readPreference();
    applyPreference(currentPreference);
    syncControls();
  });
  if (media) {
    var onSystemChange = function () {
      if (currentPreference === "system") applyPreference("system");
    };
    if (typeof media.addEventListener === "function") media.addEventListener("change", onSystemChange);
    else if (typeof media.addListener === "function") media.addListener(onSystemChange);
  }
})();
