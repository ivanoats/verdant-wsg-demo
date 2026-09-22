import { defineConfig } from '@pandacss/dev'
import { fontFamilyTokens, spacingTokens, radiiTokens, fontSizeTokens, lineHeightTokens } from './scripts/tokens.mjs'
import { semanticColorTokens } from './scripts/theme.mjs'

export default defineConfig({
  preflight: true,
  // Plain static HTML site — the only "source" Panda extracts from is the
  // build scripts, which call css()/patterns()/recipes to produce the class
  // strings baked into the generated HTML (art.mjs holds the SVG art).
  include: ['./scripts/**/*.mjs'],
  exclude: [],
  outdir: 'styled-system',

  // Dark mode is driven by the OS preference, full stop — this is the WSG
  // check (3.12) a scanner looks for. The ThemeToggle demo does not use a
  // Panda condition at all: it overrides the same CSS custom properties
  // inline at runtime, which always wins over a stylesheet rule without
  // needing a second selector-based condition to fight the cascade with.
  conditions: {
    dark: '@media (prefers-color-scheme: dark)',
  },

  theme: {
    extend: {
      tokens: {
        fonts: Object.fromEntries(Object.entries(fontFamilyTokens).map(([key, value]) => [key, { value }])),
        spacing: Object.fromEntries(Object.entries(spacingTokens).map(([key, value]) => [key, { value }])),
        radii: Object.fromEntries(Object.entries(radiiTokens).map(([key, value]) => [key, { value }])),
        fontSizes: Object.fromEntries(Object.entries(fontSizeTokens).map(([key, value]) => [key, { value }])),
        lineHeights: Object.fromEntries(Object.entries(lineHeightTokens).map(([key, value]) => [key, { value }])),
      },
      semanticTokens: {
        // Illustration-only greens: the "verdant" in Verdant. Never text or
        // UI state — they're chosen for lushness, not 4.5:1 contrast.
        colors: semanticColorTokens,
        shadows: {
          sm: {
            value: {
              base: '0 1px 2px rgba(28,26,21,0.08), 0 1px 1px rgba(28,26,21,0.04)',
              _dark: '0 1px 2px rgba(0,0,0,0.45), 0 1px 1px rgba(0,0,0,0.3)',
            },
          },
        },
      },
      recipes: {
        button: {
          className: 'btn',
          base: {
            fontSize: 'label', lineHeight: 'label', fontWeight: '600', letterSpacing: '0.02em',
            paddingBlock: '2', paddingInline: '4', borderRadius: 'md', border: '1px solid transparent',
            cursor: 'pointer', outlineOffset: '2px', display: 'inline-block',
            _motionSafe: { transition: 'background-color 120ms ease, border-color 120ms ease' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
          },
          variants: {
            variant: {
              primary: { background: 'accent', color: 'accent.ink', _hover: { background: 'accent.strong' } },
              secondary: { background: 'transparent', color: 'ink', borderColor: 'border', _hover: { borderColor: 'accent', color: 'accent' } },
            },
          },
          defaultVariants: { variant: 'primary' },
        },
        card: {
          className: 'card',
          base: {
            background: 'surface.200', border: '1px solid', borderColor: 'border',
            borderRadius: 'md', padding: '4',
          },
        },
        fieldInput: {
          className: 'fieldInput',
          base: {
            fontSize: 'body', lineHeight: 'body', fontFamily: 'sans',
            paddingBlock: '2', paddingInline: '3', border: '1px solid', borderColor: 'border',
            borderRadius: 'sm', background: 'surface.200', color: 'ink',
            _focusVisible: { outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '1px', borderColor: 'transparent' },
          },
        },
        switchTrack: {
          className: 'switchTrack',
          base: {
            position: 'relative', width: '44px', height: '24px', borderRadius: 'full',
            background: 'border', border: 'none', cursor: 'pointer', padding: '0', flex: 'none',
            _motionSafe: { transition: 'background-color 150ms ease' },
          },
          variants: {
            on: { true: { background: 'accent' } },
          },
        },
        spinner: {
          className: 'spinner',
          base: {
            width: '28px', height: '28px', borderRadius: 'full',
            border: '3px solid', borderColor: 'border', borderTopColor: 'accent',
            _motionSafe: { animation: 'spin 900ms linear infinite' },
          },
        },
        skeleton: {
          className: 'skeleton',
          base: {
            borderRadius: 'sm', background: 'border', opacity: '0.5',
            _motionSafe: { animation: 'pulse 1400ms ease-in-out infinite' },
          },
        },
      },
    },
  },

  globalCss: {
    'html': { colorScheme: 'light dark' },
    'body': { margin: '0', background: 'surface.100', color: 'ink', fontFamily: 'sans', fontSize: 'body', lineHeight: 'body' },
    'a': { color: 'accent' },
    'a:hover': { color: 'accent.strong' },
    ':focus-visible': { outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '2px' },
    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
    '@keyframes pulse': { '0%, 100%': { opacity: '0.35' }, '50%': { opacity: '0.65' } },
    // Verdant's art grows in once, then holds still. Only referenced from
    // inside prefers-reduced-motion: no-preference (see scripts/art.mjs).
    '@keyframes leafGrow': { from: { transform: 'scale(0)' }, to: { transform: 'scale(1)' } },
    '@keyframes stemGrow': { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
    '@keyframes hillRise': { from: { opacity: '0', transform: 'translateY(40px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    '@keyframes sprout': { from: { transform: 'scale(0.2)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
    '@keyframes sunRise': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    '.switchTrack .knob': {
      position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px',
      borderRadius: 'var(--radii-full)', background: 'var(--colors-surface-200)',
    },
    '@media (prefers-reduced-motion: no-preference)': {
      '.switchTrack .knob': { transition: 'transform 150ms ease' },
    },
    '.switchTrack[aria-checked="true"] .knob': { transform: 'translateX(20px)' },
    // Decorative-only art is dropped for anyone who's asked to save data —
    // it costs bytes and carries no content (WSG 3.12's third preference query).
    '@media (prefers-reduced-data: reduce)': {
      '.decor': { display: 'none' },
    },
  },
  // No staticCss block on purpose: every class in the generated stylesheet
  // comes from a real call in scripts/build.mjs. Force-generating a wide
  // utility surface "just in case" is exactly the CSS-redundancy WSG 4.2/4.3
  // checks flag — extraction only emits what's actually used.
})
