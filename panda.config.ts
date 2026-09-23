import { defineConfig } from '@pandacss/dev'
import { verdantPreset } from './packages/verdant-design/src/preset.mjs'

export default defineConfig({
  preflight: true,
  // Verdant's tokens, recipes, layout primitives and theme contract all live in
  // the preset (packages/verdant-design) so other projects can install the same
  // design system. This file holds only what is specific to building this site.
  presets: ['@pandacss/dev/presets', verdantPreset],

  // Plain static HTML site — the only "source" Panda extracts from is the
  // build scripts, which call css()/patterns()/recipes to produce the class
  // strings baked into the generated HTML (art.mjs holds the SVG art).
  include: ['./scripts/**/*.mjs'],
  exclude: [],
  outdir: 'styled-system',

  // No staticCss block on purpose: every class in the generated stylesheet
  // comes from a real call in scripts/build.mjs. Force-generating a wide
  // utility surface "just in case" is exactly the CSS-redundancy WSG 3.2/3.4
  // guidance tries to avoid — extraction only emits referenced styles.
})
