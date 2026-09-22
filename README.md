# Verdant — WSG demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web as a lightweight implementation demo for the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/). The repository's dated evidence register, hosting-provenance notes, and unresolved owner decisions live in [`docs/wsg-evidence-register.md`](docs/wsg-evidence-register.md).

The home page promotes the system; `/components.html` is the live component gallery. Both are styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract exactly the CSS those pages use — no runtime CSS-in-JS, no unused utility classes shipped.

## Build

```
npm install
npm run dev     # http://localhost:4321 — rebuilds on save and reloads the browser
npm run build   # panda codegen -> generate HTML -> panda cssgen (minified, lightningcss) -> measure page weight -> hash asset names
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## Evidence and maintenance notes

- Repository implementation evidence and open documentation gaps: [`docs/wsg-evidence-register.md`](docs/wsg-evidence-register.md)
- Build-time implementation checks still surface on the site and can be re-run locally; they do not replace maintainer-supplied operational evidence.

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- Dark theme via `prefers-color-scheme`, no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- Decorative image dropped under `prefers-reduced-data: reduce`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and an offline service worker in `public/` / `_headers`
- Content-hashed CSS/JS under `/assets/` (`scripts/fingerprint.mjs`), cached for a year; pages are network-first in the service worker, so a deploy never mixes new HTML with old CSS
- No third-party scripts, no analytics, no web fonts, no icon font
- "Geometric growth" art (`scripts/art.mjs`): inline SVG built from the system's own shapes, every fill a color token, so it recolors with the theme and costs no requests; it grows in once, only when motion is allowed
- The page-weight numbers on the home page are measured by `scripts/stats.mjs` on every build, never hand-typed

See the site itself for the full decision-to-guideline mapping.
