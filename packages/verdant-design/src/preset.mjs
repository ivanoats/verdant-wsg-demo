// The Verdant design system as a PandaCSS preset: tokens, semantic colours,
// recipes, layout primitives and the theme/contrast contract.
//
// Everything here is theme data. The site that consumes it supplies its own
// `include`/`outdir` (see the repo's panda.config.ts for a worked example).
import { definePreset } from '@pandacss/dev'
import { fontFamilyTokens, spacingTokens, radiiTokens, fontSizeTokens, lineHeightTokens } from './tokens.mjs'
import { explicitThemeVars, highContrastVars, semanticColorTokens, themeOverrideAttr, themeResolvedAttr } from './theme.mjs'

const important = (vars) =>
  Object.fromEntries(Object.entries(vars).map(([name, value]) => [name, `${value} !important`]))

export const verdantPreset = definePreset({
  name: 'verdant-design',
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

  // Layout primitives. These replace Panda's built-in container, stack and
  // grid so every default comes from Verdant's tokens: a 1080px page
  // container with token padding, and 16px (spacing 4) gaps. Grid tracks use
  // minmax(0, 1fr), and auto-fit tracks cap their minimum at 100%, so a wide
  // fallback font can never push a column past a 320px viewport.
  patterns: {
    extend: {
      container: {
        description: 'Centered page container, capped at 1080px, with responsive token padding.',
        properties: { maxWidth: { type: 'property', value: 'maxWidth' } },
        defaultValues: { maxWidth: '1080px' },
        transform(props) {
          const { maxWidth, ...rest } = props
          return { position: 'relative', width: '100%', maxWidth, marginInline: 'auto', paddingInline: { base: '4', md: '6' }, ...rest }
        },
      },
      stack: {
        description: 'Vertical (or horizontal) flow with a spacing-token gap.',
        properties: {
          align: { type: 'property', value: 'alignItems' },
          justify: { type: 'property', value: 'justifyContent' },
          direction: { type: 'property', value: 'flexDirection' },
          gap: { type: 'property', value: 'gap' },
        },
        defaultValues: { direction: 'column', gap: '4' },
        transform(props) {
          const { align, justify, direction, gap, ...rest } = props
          return { display: 'flex', flexDirection: direction, alignItems: align, justifyContent: justify, gap, ...rest }
        },
      },
      grid: {
        description: 'Responsive grid: fixed columns, or auto-fit columns with a minimum child width.',
        properties: {
          gap: { type: 'property', value: 'gap' },
          columns: { type: 'number' },
          minChildWidth: { type: 'string' },
        },
        defaultValues: { gap: '4' },
        transform(props, { map }) {
          const { gap, columns, minChildWidth, ...rest } = props
          const tracks = () => {
            if (columns != null) return map(columns, (v) => `repeat(${v}, minmax(0, 1fr))`)
            if (minChildWidth != null) return map(minChildWidth, (v) => `repeat(auto-fit, minmax(min(${v}, 100%), 1fr))`)
            return undefined
          }
          return { display: 'grid', gridTemplateColumns: tracks(), gap, ...rest }
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
    // prefers-contrast: more — stronger token values in whichever theme is
    // showing, plus thicker boundaries. Same !important reasoning as above;
    // these come later in the same layer, so they win over the plain theme.
    '@media (prefers-contrast: more)': {
      [`html:not([${themeOverrideAttr}]), html[${themeOverrideAttr}="light"]`]: important(highContrastVars.light),
      [`html[${themeOverrideAttr}="dark"]`]: important(highContrastVars.dark),
      '.fieldInput, .btn--variant_secondary, .card': { borderWidth: '2px !important' },
      ':focus-visible': { outlineWidth: '3px !important' },
      'a': { textDecorationThickness: '0.12em' },
    },
    '@media (prefers-contrast: more) and (prefers-color-scheme: dark)': {
      [`html:not([${themeOverrideAttr}])`]: important(highContrastVars.dark),
    },
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
})

export default verdantPreset
