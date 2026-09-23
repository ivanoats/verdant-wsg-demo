# Verdant — WSG-aligned demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web as a lightweight implementation demo for the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/). The homepage scorecard is generated from the saved [`public/wsg-evidence.json`](public/wsg-evidence.json) record rather than presented as a live conformance audit; the dated evidence register, hosting-provenance notes, and unresolved owner decisions live in [`docs/wsg-evidence-register.md`](docs/wsg-evidence-register.md).

The home page promotes the system; `/components` is the public component-gallery route, backed by the generated `components.html` file. Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract the styles those pages reference — no browser-side CSS-in-JS runtime and no broad pre-generated utility bundle.

## Build

```
npm install
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen -> hash final asset names -> measure finalized assets and transfer
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## Validation record

Manual cross-browser, accessibility, and usability validation planning/status is tracked in [`VALIDATION.md`](./VALIDATION.md).

## Evidence and maintenance notes

- Repository implementation evidence and open documentation gaps: [`docs/wsg-evidence-register.md`](docs/wsg-evidence-register.md)
- Build-time implementation checks still surface on the site and can be re-run locally; they do not replace maintainer-supplied operational evidence.

`npm run build` also publishes the measurement artifacts that CI can consume:

- `dist/measurements.json` — finalized build report with byte budgets, derived resource sets, local transfer observations, and explicitly unmeasured production-network fields
- `dist/measurements.schema.json` — JSON Schema for the report shape

## Profiling the decorative SVGs

This repo keeps the hero valley and CTA meadow inline, so profile the generated HTML before changing the artwork:

```bash
npm run build
npm run profile:art
```

That reports the generated homepage's DOM/SVG element counts plus raw, gzip, and Brotli sizes for the page, all inline SVG markup, the hero scene, and the CTA meadow.

For the CPU-throttled animation pass used in issue #11, serve `dist/` and run the same profiler against the live page. Playwright is a pinned dev dependency (CI uses it too); it is not part of the shipped site.

```bash
./node_modules/.bin/playwright install chromium
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

## CI coverage

`npm run verify:ci` is what `.github/workflows/ci.yml` runs on every pull request and on `main`, on the Node 20 runtime pinned in `.nvmrc` (the same version `netlify.toml` builds with):

- `npm ci --ignore-scripts`, then a full `npm run build` from the lockfile.
- `scripts/check-budgets.mjs` compares the finalized `dist/measurements.json` against the reviewed limits in `ci/budgets.json` and writes `artifacts/ci-audit.json`.
- `tests/service-worker.test.mjs` and `tests/measurements.test.mjs` check the production worker, the published offline-cache contract and the measurement report against its schema.
- `tests/site.spec.mjs` (Playwright, Chromium) checks behavior in a real browser against `scripts/serve-dist.mjs`: field hints and placeholder contrast, prose-link underlines, skip-link focus, no horizontal scroll at 320px, theme persistence and live System mode, and the bounded, reduced-motion-safe loading preview.

The run uploads the measurement report, its schema, the offline-cache contract and the audit as artifacts. Assistive-technology, cross-device and usability checks stay manual and are tracked in [`VALIDATION.md`](./VALIDATION.md).

### Budget rationale

`ci/budgets.json` records the 2026-09-22 baselines from `dist/measurements.json` with modest headroom above each. A budget failure means the change added weight; raise a limit only in a reviewed change that says why.

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- System/Light/Dark theme preference from one token source, with `prefers-color-scheme` as the no-JS default and no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- Decorative art stays inline, so the default page weight stays the same even in browsers that ignore `prefers-reduced-data`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and an offline service worker in `public/` / `_headers`
- Content-hashed CSS/JS under `/assets/` (`scripts/fingerprint.mjs`), cached for a year; pages are network-first in the service worker, so a deploy never mixes new HTML with old CSS
- No third-party scripts, no analytics, no web fonts, no icon font
- "Geometric growth" art (`scripts/art.mjs`): inline SVG built from the system's own shapes, every fill a color token, so it recolors with the theme and costs no requests; it grows in once, only when motion is allowed
- `scripts/stats.mjs` measures finalized assets on every build, writes `dist/measurements.json` plus `dist/measurements.schema.json` for CI budgets, and updates the home-page summary without hand-typed numbers

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
