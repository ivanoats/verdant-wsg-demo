# Verdant — WSG demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web, built so it scores well against the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/). The homepage links out to [wsg-check](https://github.com/ivanoats/wsg-check), but that scanner only covers its own homepage categories and is not treated here as blanket WSG conformance.

The home page promotes the system; `/components` is the live component gallery (`dist/components.html` at build time). Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract exactly the CSS those pages use — no runtime CSS-in-JS, no unused utility classes shipped.

## Build

Node 20 is the supported CI/hosting runtime (`.nvmrc`, `netlify.toml`).

```
npm ci
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen -> fingerprint final assets -> stamp SW -> write finalized measurements.json
npm run verify:ci
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## CI coverage

- `.github/workflows/ci.yml` runs the lockfile-based build on Node 20, enforces reviewed budgets from `ci/budgets.json`, and uploads `dist/measurements.json`, `dist/measurements.schema.json`, `dist/offline-cache.json`, and `artifacts/ci-audit.json`.
- `tests/site.spec.mjs` stays behavior-focused so it can survive the gallery/specimen work in #23 while still covering the reviewed regressions: prose-link affordance, placeholder contrast, field associations, skip-link focus, narrow-width overflow, theme persistence/system changes, and bounded reduced-motion demos.
- `tests/service-worker.test.mjs` exercises the production worker in `dist/sw.js` against the published offline cache contract in `dist/offline-cache.json`.
- Manual follow-up is still required for issue #13 items such as assistive-technology checks, broader browser/device coverage, and human usability testing.
- CI is still blocked on some upstream integration details: the update-prompt interaction from #21, final specimen copy/structure from #17 and #23, and any additional measurement fields that land in #19 beyond the current published schema.

## Budget rationale

`ci/budgets.json` records the 2026-09-22 reviewed baselines and thresholds against the published `dist/measurements.json` schema from #19. The limits leave modest headroom over the current finalized measurements while documenting which checks are still blocked on upstream theme/offline/motion integration.

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
- The page-weight numbers on the home page plus the machine-readable measurement artifacts in `dist/measurements.json` / `dist/measurements.schema.json` are generated on every build, never hand-typed

See the site itself for the full decision-to-guideline mapping.
