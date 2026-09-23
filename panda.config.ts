import { defineConfig } from '@pandacss/dev'
import { fontFamilyTokens, spacingTokens, radiiTokens, fontSizeTokens, lineHeightTokens } from './scripts/tokens.mjs'
import { explicitThemeVars, semanticColorTokens, themeOverrideAttr, themeResolvedAttr } from './scripts/theme.mjs'

const important = (vars: Record<string, string>) =>
  Object.fromEntries(Object.entries(vars).map(([name, value]) => [name, `${value} !important`]))

export default defineConfig({
  preflight: true,
  // Plain static HTML site — the only "source" Panda extracts from is the
  // build scripts, which call css()/patterns()/recipes to produce the class
  // strings baked into the generated HTML (art.mjs holds the SVG art).
  include: ['./scripts/**/*.mjs'],
  exclude: [],
  outdir: 'styled-system',

  // System mode is the default: `_dark` values apply through
  // prefers-color-scheme (the WSG 3.12 preference query), with no script.
  // An explicit Light or Dark choice sets data-theme-override on <html>,
  // and the globalCss rules below map every token to that theme's value,
  // so the same token set serves all three preferences.
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
        colors: {
          ...semanticColorTokens,
        },
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
            fontSize: 'bodySm', lineHeight: 'bodySm', fontWeight: '600', letterSpacing: '0.02em',
            minHeight: '44px', paddingBlock: '2', paddingInline: '4', borderRadius: 'md', border: '1px solid transparent',
            cursor: 'pointer', outlineOffset: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecorationLine: 'none',
            _motionSafe: { transition: 'background-color 120ms ease, border-color 120ms ease' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
          },
          variants: {
            variant: {
              primary: {
                background: 'accent', color: 'accent.ink', _hover: { background: 'accent.strong' },
                // Toggle buttons: the pressed look follows aria-pressed, so the
                // visual and announced state can't drift apart.
                '&[aria-pressed=true]': { background: 'accent.strong' },
              },
              secondary: { background: 'transparent', color: 'ink', borderColor: 'border.control', _hover: { borderColor: 'accent', color: 'accent' } },
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
            width: '100%', minHeight: '44px', paddingBlock: '2', paddingInline: '3', border: '1px solid', borderColor: 'border.control',
            borderRadius: 'sm', background: 'surface.200', color: 'ink',
            _placeholder: { color: 'ink.placeholder', opacity: '1' },
            _focusVisible: { outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '1px', borderColor: 'transparent' },
            _readOnly: { background: 'surface.100', color: 'ink.muted' },
          },
        },
        switchTrack: {
          className: 'switchTrack',
          base: {
            position: 'relative', width: '44px', height: '44px', borderRadius: 'full',
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', flex: 'none',
            _before: {
              content: '""',
              position: 'absolute',
              top: '10px',
              left: '0',
              width: '44px',
              height: '24px',
              borderRadius: 'full',
              background: 'border.control',
            },
            _motionSafe: { _before: { transition: 'background-color 150ms ease' } },
            // State lives in aria-checked at runtime, so the track colour follows
            // it here (inside the recipe layer, so it outranks the base colour).
            '&[aria-checked="true"]': { _before: { background: 'accent' } },
          },
          variants: {
            on: { true: { _before: { background: 'accent' } } },
          },
        },
        spinner: {
          className: 'spinner',
          base: {
            width: '28px', height: '28px', borderRadius: 'full',
            border: '3px solid', borderColor: 'border', borderTopColor: 'accent',
          },
          variants: {
            preview: {
              true: {
                _motionSafe: { animation: 'spin 900ms linear 4' },
              },
            },
          },
        },
        skeleton: {
          className: 'skeleton',
          base: {
            borderRadius: 'sm', background: 'border', opacity: '0.5',
          },
          variants: {
            preview: {
              true: {
                _motionSafe: { animation: 'pulse 1400ms ease-in-out 3' },
              },
            },
          },
        },
      },
    },
  },

  globalCss: {
    'html': { colorScheme: 'light dark' },
    // Panda emits token variables in the `tokens` layer, which comes after
    // `base` (where globalCss lives), so a plain declaration here would lose
    // to them. `!important` in an earlier layer beats normal declarations in
    // any later layer, which is exactly the override an explicit choice needs.
    [`html[${themeOverrideAttr}="light"]`]: important(explicitThemeVars.light),
    [`html[${themeOverrideAttr}="dark"]`]: important(explicitThemeVars.dark),
    [`html[${themeResolvedAttr}="light"]`]: { colorScheme: 'light' },
    [`html[${themeResolvedAttr}="dark"]`]: { colorScheme: 'dark' },
    'body': { margin: '0', background: 'surface.100', color: 'ink', fontFamily: 'sans', fontSize: 'body', lineHeight: 'body' },
    'a': {
      color: 'accent',
      textDecoration: 'underline',
      textUnderlineOffset: '0.15em',
      textDecorationThickness: '0.08em',
    },
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
      position: 'absolute', top: '12px', left: '2px', width: '20px', height: '20px',
      borderRadius: 'var(--radii-full)', background: 'var(--colors-surface-200)',
    },
    '@media (prefers-reduced-motion: no-preference)': {
      '.switchTrack .knob': { transition: 'transform 150ms ease' },
    },
    '.switchTrack[aria-checked="true"] .knob': { transform: 'translateX(20px)' },
  },
  // No staticCss block on purpose: every class in the generated stylesheet
  // comes from a real call in scripts/build.mjs. Force-generating a wide
  // utility surface "just in case" is exactly the CSS-redundancy WSG 3.2/3.4
  // guidance tries to avoid — extraction only emits referenced styles.
})
