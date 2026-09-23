# verdant-design

Verdant is a [PandaCSS](https://panda-css.com) preset with defaults aligned to selected [W3C Web Sustainability Guidelines](https://w3c.github.io/sustainableweb-wsg/): system fonts instead of downloaded ones, only the CSS a page actually uses, contrast-verified semantic colour tokens, and dark mode, reduced motion and increased contrast respected out of the box.

It ships tokens, recipes, layout primitives and a theme contract — not a component library. You write your own markup.

```bash
npm install -D verdant-design
```

```js
// panda.config.ts
import { defineConfig } from '@pandacss/dev'
import { verdantPreset } from 'verdant-design'

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/dev/presets', verdantPreset],
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  outdir: 'styled-system',
})
```

To make an explicit Light/Dark choice work you also need the theme runtime shipped at
`verdant-design/theme-toggle.js`. Without it you get `prefers-color-scheme` only.

**[Full installation guide, token reference and known gaps →](https://github.com/ivanoats/verdant-wsg-demo/blob/main/docs/INSTALL.md)**

## What's in it

- **Tokens** — a 7-step spacing scale, 4 radii, 6 type sizes, system `sans`/`mono` stacks. No web fonts.
- **Semantic colours** — `surface.*`, `ink.*`, `accent.*`, `border.*`, status colours, each with light and dark values. 17 pairings contrast-verified in both themes; worst text pairing 4.80:1, worst functional 4.35:1.
- **Recipes** — `button`, `card`, `fieldInput`, `switchTrack`, `spinner`, `skeleton`. 44px minimum targets; animation bounded and gated behind `prefers-reduced-motion`.
- **Patterns** — `container`, `stack`, `grid`, replacing Panda's built-ins so defaults come from Verdant's scale.
- **Theme contract** — System/Light/Dark from one token set, plus a `prefers-contrast: more` set verified at 7:1 text and 4.5:1 boundaries.

## Status

0.x — the API may change between minor versions. See [known gaps](https://github.com/ivanoats/verdant-wsg-demo/blob/main/docs/INSTALL.md#known-gaps).

Live demo and reference implementation: [verdant-wsg-demo.netlify.app](https://verdant-wsg-demo.netlify.app/)

## License

ISC
