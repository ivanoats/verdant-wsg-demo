# Verdant — WSG demo site

A small static site that puts the [Verdant design system](https://claude.ai/artifact/1hu6m4apzrfeM9s8nWcmxf) on the web, built so it scores well against the W3C [Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/) — checked with [wsg-check](https://github.com/ivanoats/wsg-check).

Two pages (`/` and `/components.html`), styled entirely with [PandaCSS](https://panda-css.com): tokens and recipes in `panda.config.ts`, a small build script (`scripts/build.mjs`) that generates the HTML and lets Panda statically extract exactly the CSS those pages use — no runtime CSS-in-JS, no unused utility classes shipped.

## Build

```
npm install
npm run build   # panda codegen -> generate HTML -> panda cssgen (minified, lightningcss)
```

Output lands in `dist/` — that's the Netlify publish directory (see `netlify.toml`).

## What's deliberately in here

- Zero web fonts (`system-ui` stack)
- Dark theme via `prefers-color-scheme`, no separate stylesheet
- Every animation gated behind `prefers-reduced-motion: no-preference`
- Decorative image dropped under `prefers-reduced-data: reduce`
- Landmarks (`main`, `nav`, skip link), a labelled form field, one consistent focus ring
- Security headers, caching directives, and a minimal offline service worker in `public/` / `_headers`
- No third-party scripts, no analytics, no web fonts, no icon font

See the site itself for the full decision-to-guideline mapping.
