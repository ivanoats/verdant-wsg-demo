# Verdant — WSG-aligned demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web as a lightweight design-system starter with defaults aligned to selected [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/). The homepage summary is generated from the saved [`public/wsg-evidence.json`](public/wsg-evidence.json) record rather than presented as a live conformance audit.

The home page promotes the system; `/components.html` is the live component gallery. Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract the styles those pages reference — no browser-side CSS-in-JS runtime and no broad pre-generated utility bundle.

## Build

```
npm install
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen (minified, lightningcss) -> measure page weight -> hash asset names
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- Dark theme via `prefers-color-scheme`, no separate stylesheet
- Decorative animation gated behind `prefers-reduced-motion: no-preference`
- One decorative image dropped under `prefers-reduced-data: reduce`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and an offline service worker in `public/` / `_headers`
- Content-hashed CSS/JS under `/assets/` (`scripts/fingerprint.mjs`), cached for a year; pages are network-first in the service worker, so a deploy never mixes new HTML with old CSS
- No third-party scripts, no analytics, no web fonts, no icon font
- "Geometric growth" art (`scripts/art.mjs`): inline SVG built from the system's own shapes, every fill a color token, so it recolors with the theme and costs no requests; it grows in once, only when motion is allowed
- The page-weight numbers on the home page are measured by `scripts/stats.mjs` on every build using Brotli estimates for comparison, never hand-typed

See the site itself for the full decision-to-guideline mapping.
