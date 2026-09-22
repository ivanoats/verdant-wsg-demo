# Verdant — WSG demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web, built so it scores well against the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/). The homepage links out to [wsg-check](https://github.com/ivanoats/wsg-check), but that scanner only covers its own homepage categories and is not treated here as blanket WSG conformance.

The home page promotes the system; `/components` is the live component gallery (`dist/components.html` at build time). Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract exactly the CSS those pages use — no runtime CSS-in-JS, no unused utility classes shipped.

## Build

Node 20 is the supported CI/hosting runtime (`.nvmrc`, `netlify.toml`).

```
npm ci
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen -> fingerprint final assets -> stamp SW -> write asset metrics
npm run verify:ci
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## CI coverage

- `.github/workflows/ci.yml` runs the lockfile-based build on Node 20, enforces reviewed Brotli budgets from `ci/budgets.json`, and uploads `dist/asset-metrics.json` plus `artifacts/ci-audit.json`.
- `tests/site.spec.mjs` keeps the browser checks focused on the reviewed regressions: prose-link affordance, placeholder contrast, field associations, skip-link focus, narrow-width overflow, theme persistence/system changes, and bounded reduced-motion demos.
- `tests/service-worker.test.mjs` exercises the production worker in `dist/sw.js` for pretty-URL matching, offline fallback behavior, cache ownership cleanup, and non-disruptive updates.
- Manual follow-up is still required for issue #13 items such as assistive-technology checks, broader browser/device coverage, and human usability testing.

## Budget rationale

`ci/budgets.json` records the 2026-09-22 reviewed Brotli baselines and thresholds. The limits allow roughly 1&ndash;1.5 KiB of growth over the current homepage/offline-shell measurements while keeping the extracted stylesheet, UI helper, and service worker close to their reviewed compressed baselines.

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- Dark theme via `prefers-color-scheme`, no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- Decorative image dropped under `prefers-reduced-data: reduce`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and an offline service worker in `public/` / `_headers`
- Content-hashed CSS/JS under `/assets/` (`scripts/finalize.mjs`), cached for a year; pages are network-first in the service worker, so a deploy never mixes new HTML with old CSS
- No third-party scripts, no analytics, no web fonts, no icon font
- "Geometric growth" art (`scripts/art.mjs`): inline SVG built from the system's own shapes, every fill a color token, so it recolors with the theme and costs no requests; it grows in once, only when motion is allowed
- The page-weight numbers on the home page and the machine-readable bundle report in `dist/asset-metrics.json` are generated on every build, never hand-typed

See the site itself for the full decision-to-guideline mapping.
