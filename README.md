# Verdant — WSG-aligned demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web as a lightweight implementation demo for the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/). The homepage scorecard is generated from the saved [`public/wsg-evidence.json`](public/wsg-evidence.json) record rather than presented as a live conformance audit; the dated evidence register, hosting-provenance notes, and unresolved owner decisions live in [`docs/wsg-evidence-register.md`](docs/wsg-evidence-register.md).

The home page promotes the system; `/components` is the public component-gallery route, backed by the generated `components.html` file. Both are styled entirely with [PandaCSS](https://panda-css.com): the design system itself lives in the `verdant-design` package, and a small build script generates the HTML so Panda can statically extract the styles those pages reference — no browser-side CSS-in-JS runtime and no broad pre-generated utility bundle.

## Using Verdant in your own project

The design system is published as a PandaCSS preset. See **[`docs/INSTALL.md`](docs/INSTALL.md)** for installation, the token reference, the theme contract, and known gaps.

```bash
npm install -D verdant-design
```

## Where things live

| Path | What it is |
| --- | --- |
| `packages/verdant-design/` | The design system: tokens, semantic colours, recipes, layout patterns, theme contract. An npm workspace this site consumes like any other project would |
| `content/*.md` | Prose pages. Markdown with frontmatter; rendered through `scripts/lib/markdown.mjs` |
| `scripts/pages/` | One module per route (`home`, `components`, `green-web`, `status`) |
| `scripts/styles.mjs` | Shared style bindings — page chrome, type scale, prose |
| `scripts/shell.mjs` | The page shell: header, nav, breadcrumb, footer, `<head>` |
| `scripts/client/` | Browser-side scripts: theme toggle, gallery previews, service worker |
| `scripts/build.mjs` | Orchestration only — imports the pages and writes `dist/` |
| `panda.config.ts` | Site build config; registers the preset and sets `include`/`outdir` |

To edit page copy, start in `content/` for prose pages and `scripts/pages/` for everything else. Style bindings must stay literal `css()`/recipe/pattern calls so Panda can extract them.

## Build

```bash
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

`npm run verify:ci` is what `.github/workflows/ci.yml` runs on every pull request and on `main`, on the Node 24 runtime pinned in `.nvmrc` (the same version `netlify.toml` builds with):

- `npm ci --ignore-scripts`, then a full `npm run build` from the lockfile.
- `scripts/check-budgets.mjs` compares the finalized `dist/measurements.json` against the reviewed limits in `ci/budgets.json`, totals any web-font files in `dist/` against `webFontsKiB` (0 by default), and writes `artifacts/ci-audit.json`.
- `tests/service-worker.test.mjs` and `tests/measurements.test.mjs` check the production worker, the published offline-cache contract and the measurement report against its schema.
- `tests/site.spec.mjs` (Playwright, Chromium) checks behavior in a real browser against `scripts/serve-dist.mjs`: field hints and placeholder contrast, prose-link underlines, skip-link focus, no horizontal scroll at 320px, theme persistence and live System mode, and the bounded, reduced-motion-safe loading preview.
- `tests/a11y.spec.mjs` runs [axe-core](https://github.com/dequelabs/axe-core) on every page (`/`, `/components`, the 404 and the offline page) for WCAG 2.x A and AA rules, in light, dark and both high-contrast modes.
- `tests/visual.spec.mjs` screenshots each gallery specimen in light, dark and high contrast and compares it with the baselines in `tests/__screenshots__`. Baselines are rendered on the pinned `ubuntu-24.04` runner, so these tests are skipped locally unless `VISUAL=1`. When a visual change is intended, add the `update-screenshots` label to the PR. `.github/workflows/update-screenshots.yml` then re-renders the baselines and commits them to the branch, where the image diff is reviewed like code.

The run uploads the measurement report, its schema, the offline-cache contract, the audit and, on failure, Playwright's `test-results/` (including expected/actual/diff images) as artifacts. Assistive-technology, cross-device and usability checks stay manual and are tracked in [`VALIDATION.md`](./VALIDATION.md).

### Budget rationale

`ci/budgets.json` records the 2026-09-22 baselines from `dist/measurements.json` with modest headroom above each. A budget failure means the change added weight; raise a limit only in a reviewed change that says why.

## Custom web fonts: the off-ramp

Verdant's default is the system font stack (`system-ui` for text, `ui-monospace` for code). It costs no bytes and no requests, and CI holds web fonts to a **0 KiB** budget. Keep that default wherever you can. When a brand really needs its own typeface, take this path so the font doesn't undo the rest of the weight budget. It follows the WSG's guidance to take a more sustainable approach to typefaces ([UX Design section](https://www.w3.org/TR/web-sustainability-guidelines/)).

1. **Scope it.** Use the brand face for headings and the wordmark only; keep body copy, forms and code on the system stacks. One face is the target; every extra weight or style is another file.
2. **Self-host WOFF2 only.** Serve fonts from the site's own origin under `/assets/`, so `scripts/fingerprint.mjs` hashes them and `public/_headers` caches them for a year. Avoid third-party font CDNs: they add connections and share visitors' requests, and the site's CSP (`default-src 'self'`, which also covers fonts) would block them anyway. Skip WOFF, TTF and EOT fallbacks; every supported browser reads WOFF2.
3. **Subset it.** Keep only the scripts and glyphs the content uses. Prefer one variable font over several static weights when you need more than two weights.

   ```bash
   pip install fonttools brotli
   pyftsubset Brand.ttf --flavor=woff2 --layout-features='kern,liga' \
     --unicodes='U+0000-00FF,U+2013-2014,U+2018-201D,U+2026' \
     --output-file=public/assets/brand-subset.woff2
   ```

4. **Load it without blocking or shifting.** Use `font-display: swap`, preload only the one face used above the fold, and give the fallback matching metrics so the swap doesn't move the layout:

   ```css
   @font-face {
     font-family: 'Brand';
     src: url('/assets/brand-subset.woff2') format('woff2');
     font-display: swap;
     font-weight: 600 700;
   }
   @font-face {                 /* metric-matched fallback: tune the values per font */
     font-family: 'Brand Fallback';
     src: local('Arial');
     size-adjust: 104%;
     ascent-override: 92%;
     descent-override: 24%;
   }
   ```

   ```html
   <link rel="preload" href="/assets/brand-subset.woff2" as="font" type="font/woff2" crossorigin>
   ```

   Then add a token rather than hard-coding the family: `fonts.brand: "'Brand', 'Brand Fallback', system-ui, sans-serif"` in `scripts/tokens.mjs`, used only by heading styles.
5. **Budget it.** Raise `thresholds.webFontsKiB` in `ci/budgets.json` in the same reviewed change, with a `rationale` entry saying why. `scripts/check-budgets.mjs` totals every `.woff2`, `.woff`, `.ttf`, `.otf` and `.eot` file in `dist/` and fails the build over the limit. As a guide, a Latin subset of one variable face is typically 20–40 KiB; stay under 30 KiB.
6. **Respect the reader.** Under `prefers-reduced-data: reduce`, drop the web font and keep the fallback stack. It's cheap to do even though browser support is still limited.

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- System/Light/Dark theme preference from one token source, with `prefers-color-scheme` as the no-JS default and no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- `prefers-contrast: more` swaps in a stronger token set (build-verified at 7:1 for text, 4.5:1 for boundaries) and thickens control borders and the focus ring, in System, Light and Dark alike
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
