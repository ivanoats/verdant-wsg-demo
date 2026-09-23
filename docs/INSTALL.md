# Installing Verdant

Verdant is a [PandaCSS](https://panda-css.com) preset. You install one package, add it to your Panda config, and get the token set, component recipes, layout primitives and theme contract that the [demo site](https://verdant-wsg-demo.netlify.app/) is built from.

It is deliberately small. There is no component library to import, no runtime, and no JavaScript shipped to the browser except one optional theme script. You write your own markup and call Panda's `css()`, patterns and recipes.

> **Status: 0.x.** The API may change between minor versions. [Known gaps](#known-gaps) lists what is not settled yet.

## Requirements

- Node 20 or newer
- PandaCSS 1.0 or newer (declared as a peer dependency; developed and tested against 1.12)
- A build step. Panda extracts CSS statically, so it needs to see your source

## 1. Install

```bash
npm install -D verdant-design
```

## 2. Register the preset

```js
// panda.config.ts
import { defineConfig } from '@pandacss/dev'
import { verdantPreset } from 'verdant-design'

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/dev/presets', verdantPreset],

  // Where Panda looks for css()/recipe()/pattern() calls
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  outdir: 'styled-system',
})
```

Keep `'@pandacss/dev/presets'` first. Verdant extends Panda's base preset rather than replacing it, and it overrides the built-in `container`, `stack` and `grid` patterns so their defaults come from Verdant's spacing scale.

Then run codegen as usual:

```bash
panda codegen
```

## 3. Add the theme runtime

**This step is required if you want the Light/Dark control to work.** Without it you still get automatic theming through `prefers-color-scheme`, but an explicit user choice cannot take effect.

The preset's `globalCss` keys off a `data-theme-override` attribute on `<html>`. Something has to set that attribute, and it has to happen before first paint or users see a flash of the wrong theme. The package ships a script that does it:

```html
<!-- in <head>, BEFORE your stylesheet, not deferred -->
<script src="/verdant-theme-toggle.js"></script>
<link rel="stylesheet" href="/styles.css">
```

Copy it into whatever directory you serve static files from:

```bash
cp node_modules/verdant-design/src/theme-toggle.js public/verdant-theme-toggle.js
```

The script looks for radio inputs named `theme-preference` and keeps them in sync with the stored choice. Give it markup like this anywhere on the page:

```html
<fieldset aria-label="Theme preference">
  <legend>Theme</legend>
  <label for="theme-pref-system">
    <input type="radio" id="theme-pref-system" name="theme-preference" value="system" checked>
    <span>System</span>
  </label>
  <label for="theme-pref-light">
    <input type="radio" id="theme-pref-light" name="theme-preference" value="light">
    <span>Light</span>
  </label>
  <label for="theme-pref-dark">
    <input type="radio" id="theme-pref-dark" name="theme-preference" value="dark">
    <span>Dark</span>
  </label>
</fieldset>
```

The preference is stored in `localStorage` under `verdant-theme-preference`. Choosing System removes the key and falls back to the media query. If `localStorage` is unavailable the script degrades to System rather than throwing.

### The attributes it sets

| Attribute on `<html>` | Values | Purpose |
| --- | --- | --- |
| `data-theme-preference` | `system` \| `light` \| `dark` | What the user chose |
| `data-theme-resolved` | `light` \| `dark` | What that resolves to now; also drives `color-scheme` |
| `data-theme-override` | `light` \| `dark`, absent for System | What `globalCss` keys off |

If you would rather set these yourself, you can skip the script entirely — write those attributes with your own framework's theming code and the CSS will follow.

## What you get

### Tokens

Spacing is a 7-step scale, not a full ramp. Values outside it are a deliberate opt-out, not a supported token.

| Category | Tokens |
| --- | --- |
| Spacing | `1` 4px, `2` 8px, `3` 12px, `4` 16px, `6` 24px, `8` 32px, `12` 48px |
| Radii | `sm` 4px, `md` 8px, `lg` 16px, `full` 999px |
| Fonts | `sans` (system UI stack), `mono` (system mono stack) |
| Font sizes | `displayLg` 32/40, `displayMd` 24/32, `displaySm` 20/28, `body` 16/24, `bodySm` 14/20, `label` 12/16 |

**There are no web fonts, and adding one is a decision with a cost.** The `sans` stack is system-only so a page costs zero font bytes and has no font-swap reflow.

### Semantic colours

Colours are semantic, never raw hex: `surface.100`, `surface.200`, `ink`, `ink.muted`, `ink.placeholder`, `accent`, `accent.strong`, `accent.ink`, `border`, `border.control`, `focusRing`, `positive`, `info`, `warning`, `critical`, plus a decorative `foliage.*` set for illustration.

Every token carries a light and a dark value, so `_dark` is handled for you. **Use the semantic name and theming is automatic; hard-code a hex and it breaks in dark mode.**

17 foreground/background pairings are verified in both themes on every build. The worst text pairing measures **4.80:1** against a 4.5:1 floor, and the worst functional pairing (borders, focus rings) **4.35:1** against a 3:1 floor. Under `prefers-contrast: more` a stronger token set swaps in, verified at 7:1 for text and 4.5:1 for boundaries.

The `foliage.*` illustration colours are decorative and are **not** contrast-verified. Do not use them for text.

### Recipes

| Recipe | Variants | Notes |
| --- | --- | --- |
| `button` | `variant: primary \| secondary` | 44px minimum target; pressed look follows `aria-pressed` |
| `card` | — | Raised surface, token border and radius |
| `fieldInput` | — | 44px minimum; styled placeholder, focus and read-only states |
| `switchTrack` | `on: true` | Visual state follows `aria-checked` |
| `spinner` | `preview: true` | Animates only under `prefers-reduced-motion: no-preference`, and only in `preview` |
| `skeleton` | `preview: true` | Same bounded-motion rule |

```js
import { button, card } from '../styled-system/recipes'
const primary = button({ variant: 'primary' })
```

Motion is opt-in by design. The animated variants are bounded to a finite number of iterations rather than looping forever, so a loading state does not animate indefinitely.

### Layout patterns

`container` (1080px max, responsive token padding), `stack` (flex with a token gap) and `grid` (fixed or auto-fit columns). Grid tracks use `minmax(0, 1fr)`, and auto-fit tracks cap their minimum at `100%`, so a wide fallback font cannot push a column past a 320px viewport.

```js
import { container, stack, grid } from '../styled-system/patterns'
const page = container()
const column = stack({ gap: '6' })
const cards = grid({ columns: { base: 1, md: 3 } })
```

### Global CSS

Registering the preset also applies: a `body` baseline, underlined links with accent colours, a consistent 2px `:focus-visible` ring, `color-scheme` wiring, the `prefers-contrast: more` token swap with thicker control borders, and the keyframes the recipes use. Set `preflight: true` for the reset these assume.

## Browser support

Any browser supporting CSS custom properties, cascade layers and `:focus-visible` — Chrome/Edge 99+, Firefox 97+, Safari 15.4+. `prefers-contrast` and `prefers-reduced-motion` degrade silently where unsupported; you get the standard theme rather than an error.

Cascade layers are load-bearing. The preset relies on `!important` in an earlier layer beating normal declarations in a later one to make explicit theme choices win over Panda's token layer.

## Keeping pages light

The preset emits only what you reference. Two things to preserve that:

- **Do not add a `staticCss` block** unless you need it. Force-generating a wide utility surface defeats static extraction and ships CSS nobody uses.
- **Keep `css()` calls literal.** Panda extracts by reading source, so `css({ padding: '4' })` works and `css(propsFromSomewhere)` does not.

For reference, the demo site ships about 20.5 KiB for initial render, Brotli-compressed, including all CSS.

## Known gaps

Honest limits in 0.x:

- No field error, disabled, required or success specimens yet. `fieldInput` styles the input; the full accessible field pattern (hint wiring with `aria-describedby`, `aria-invalid`, actionable error text) is still yours to build.
- No visited or active/pressed treatment for links beyond the defaults.
- No release notes or changelog yet.
- Contrast is verified for the 17 documented pairings, not for every possible token combination.
- The theme runtime is a static file whose constants mirror `src/theme.mjs`. They are kept in sync by a test, but there is no single generated source.

## Working on the preset itself

The preset lives in this repository as an npm workspace, and the demo site consumes it the same way an external project would:

```bash
git clone https://github.com/ivanoats/verdant-wsg-demo.git
cd verdant-wsg-demo
npm install          # links packages/verdant-design into node_modules
npm run dev          # http://localhost:4321, rebuilds on save
npm run verify:ci    # build + byte budgets + unit and browser tests
```

Editing anything under `packages/` triggers `panda codegen` on the next dev rebuild, so token changes show up without restarting.

## License

ISC. See [LICENSE](../LICENSE).
