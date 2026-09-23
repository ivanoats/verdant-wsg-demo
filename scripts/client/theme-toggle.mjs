// Inline theme toggle: runs before paint to apply the stored System/Light/Dark
// preference, so there is no flash of the wrong theme.
import {
  themeOverrideAttr, themePreferenceAttr, themePreferenceControlName,
  themePreferenceStorageKey, themeResolvedAttr, themeTokens,
} from '@sustainablewebsites/verdant-design/theme'
import { switchOffCss, switchOnCss } from '../pages/components.mjs'

export const themeToggleJs = `(function () {
  var STORAGE_KEY = ${JSON.stringify(themePreferenceStorageKey)};
  var OVERRIDE_ATTR = ${JSON.stringify(themeOverrideAttr)};
  var PREFERENCE_ATTR = ${JSON.stringify(themePreferenceAttr)};
  var RESOLVED_ATTR = ${JSON.stringify(themeResolvedAttr)};
  var CONTROL_NAME = ${JSON.stringify(themePreferenceControlName)};
  var SWITCH_OFF = ${JSON.stringify(switchOffCss)};
  var SWITCH_ON = ${JSON.stringify(switchOnCss)};
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
  var THEME_COLOR = ${JSON.stringify({ light: themeTokens['surface.100'].light, dark: themeTokens['surface.100'].dark })};
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
    var btn = document.getElementById("theme-switch");
    if (btn) {
      var specimenOn = btn.getAttribute("aria-checked") === "true";
      var renderSwitch = function () {
        btn.className = specimenOn ? SWITCH_ON : SWITCH_OFF;
        btn.setAttribute("aria-checked", String(specimenOn));
      };
      renderSwitch();
      btn.addEventListener("click", function () {
        specimenOn = !specimenOn;
        renderSwitch();
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
`
