# Verdant — WSG demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web, built so it scores well against the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/) — checked with [wsg-check](https://github.com/ivanoats/wsg-check).

The home page promotes the system; `/components` is the public component-gallery route, backed by the generated `components.html` file. Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract exactly the CSS those pages use — no runtime CSS-in-JS, no unused utility classes shipped.

## Build

```
npm install
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen (minified, lightningcss) -> measure page weight -> hash asset names
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## Profiling the decorative SVGs

This repo keeps the hero valley and CTA meadow inline, so profile the generated HTML before changing the artwork:

```bash
npm run build
npm run profile:art
```

That reports the generated homepage's DOM/SVG element counts plus raw, gzip, and Brotli sizes for the page, all inline SVG markup, the hero scene, and the CTA meadow.

For the CPU-throttled animation pass used in issue #11, serve `dist/` and run the same profiler against the live page. The Playwright dependency is only for this local check; it is not part of the shipped site.

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
python3 -m http.server 4321 -d dist &   # background the server so the next line runs
SERVER_PID=$!
node scripts/profile-art.mjs http://127.0.0.1:4321
kill $SERVER_PID
```

The throttled run uses a 1280×900 viewport and Chrome DevTools Protocol 4× CPU slowdown, then samples `requestAnimationFrame` timing for the finite hero animation window and records `longtask` entries.

### Issue #11 measurements

| Metric | Before | After |
| --- | ---: | ---: |
| Homepage HTML raw | 71.9 KB | 61.2 KB |
| Homepage HTML gzip | 12.1 KB | 9.7 KB |
| Homepage HTML Brotli | 9.3 KB | 7.6 KB |
| Total DOM elements | 1,101 | 917 |
| Total SVG elements | 834 | 650 |
| Inline SVG raw bytes | 49.9 KB | 39.2 KB |
| Inline SVG share of raw HTML | 69.4% | 64.0% |
| Hero SVG elements | 437 | 393 |
| CTA meadow SVG elements | 340 | 200 |
| 4× CPU throttle: max long task | 91 ms | 57 ms |

Tradeoffs:

- The hero's valley, trees, sun, plant, finite motion, intrinsic dimensions, and decorative `aria-hidden="true"` / `focusable="false"` behavior stay intact.
- The measurable win came from reusing a single meadow leaf shape with `<defs>/<use>` and relaxing foreground grass density slightly while lengthening blades to keep the same silhouette.
- The 4×-throttled long-task measurement was stable enough to keep; single-frame spikes varied more between runs, so they are useful for local investigation but not recorded here as the primary comparison.
- The visual check stayed close enough that further simplification was not justified. These measurements show lower DOM/SVG complexity and a smaller worst-case main-thread burst under throttle, but they do **not** prove any energy-savings claim by themselves.

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- System/Light/Dark theme preference from one token source, with `prefers-color-scheme` as the no-JS default and no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- Decorative image dropped under `prefers-reduced-data: reduce`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and an offline service worker in `public/` / `_headers`
- Content-hashed CSS/JS under `/assets/` (`scripts/fingerprint.mjs`), cached for a year; pages are network-first in the service worker, so a deploy never mixes new HTML with old CSS
- No third-party scripts, no analytics, no web fonts, no icon font
- "Geometric growth" art (`scripts/art.mjs`): inline SVG built from the system's own shapes, every fill a color token, so it recolors with the theme and costs no requests; it grows in once, only when motion is allowed
- The page-weight numbers on the home page are measured by `scripts/stats.mjs` on every build, never hand-typed; the current first-view accounting includes both the theme bootstrap and the deferred service-worker register script

## Offline cache strategy

The production worker precaches only the tiny offline shell:

- `/`
- `/components`
- `/404.html`
- `/offline.html`
- `/manifest.json`
- `/favicon.svg`
- hashed `/assets/*.css` and `/assets/*.js`

That eager list is intentionally small because there are only two navigable pages to keep available on a cold offline first visit after installation.

`/components` is the public route and the homepage link users follow first. The worker normalizes both `/components` and `/components.html` onto that public cache key, so installation does not download the gallery twice under alias URLs. Online navigations stay network-first and refresh the canonical cached page; offline misses that do not map to a known route fall back to the dedicated offline page instead of silently showing the homepage at the wrong URL.

`public/offline-cache.json` publishes the same intended cache keys, route aliases, and update policy for related measurement, copy, and test work.

See the site itself for the full decision-to-guideline mapping.

## Theme contract

`scripts/theme.mjs` is the authoritative theme module. It exports:

- `themeTokens`, `semanticColorTokens`, `explicitThemeVars`, `themeVarName`
- `interfacePaletteOrder`, `illustrationPaletteOrder`, `themeTokenCount`
- `themePreferenceStorageKey`
- `themePreferenceControlName`
- `themePreferenceValues`
- `themePreferenceAttr`
- `themeResolvedAttr`
- `themeOverrideAttr`

Runtime contract:

- Storage key: `verdant-theme-preference`
- Form control name: `theme-preference`
- `<html data-theme-preference="system|light|dark">` records the user's selected preference
- `<html data-theme-resolved="light|dark">` records the resolved theme currently on screen
- `<html data-theme-override="light|dark">` is present only for explicit Light/Dark overrides and is omitted in System mode

Bootstrap tradeoff:

- `/theme-toggle.js` is loaded before the stylesheet on every page to apply a saved explicit preference before CSS paints, which reduces wrong-theme flash while staying compatible with the production CSP in `public/_headers` (`script-src 'self'`, no inline bootstrap)
