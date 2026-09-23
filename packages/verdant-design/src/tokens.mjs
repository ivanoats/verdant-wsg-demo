import { themeTokens, interfacePaletteOrder, illustrationPaletteOrder } from './theme.mjs'

export const fontFamilyTokens = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
}

export const spacingTokens = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
}

export const radiiTokens = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '999px',
}

export const fontSizeTokens = {
  displayLg: '32px',
  displayMd: '24px',
  displaySm: '20px',
  body: '16px',
  bodySm: '14px',
  label: '13px',
}

export const lineHeightTokens = {
  displayLg: '40px',
  displayMd: '32px',
  displaySm: '28px',
  body: '24px',
  bodySm: '20px',
  label: '16px',
}

const includeExisting = (keys) => keys.filter((key) => key in themeTokens)
const orderedInterfaceKeys = includeExisting(interfacePaletteOrder)
const orderedIllustrationKeys = includeExisting(illustrationPaletteOrder)
const orderedTokenSet = new Set([...orderedInterfaceKeys, ...orderedIllustrationKeys])
const interfaceExtras = Object.keys(themeTokens).filter((key) => !orderedTokenSet.has(key))

export const paletteSections = [
  {
    title: 'Interface',
    note: 'Public colors for text, controls, state, and supporting UI tones. Use the verified pairings below rather than assuming every token combination is readable.',
    keys: [...orderedInterfaceKeys, ...interfaceExtras],
  },
  {
    title: 'Illustration only',
    note: 'Decorative foliage and sunlight tokens. They are available for art, but not approved as default text, controls, or status meaning.',
    keys: orderedIllustrationKeys,
  },
]

// Every pairing the UI actually uses, checked at build time: scripts/build.mjs
// fails the build if any drops below its minimum in either theme. `border`
// itself is a decorative divider (below 3:1 by design); controls use
// `border.control`.
const pairingRows = [
  // [category, title, foreground, background, minimum contrast, note]
  ['text', 'Body text on site canvas', 'ink', 'surface.100', 4.5, 'Default long-form copy and labels on the page background.'],
  ['text', 'Body text on raised surface', 'ink', 'surface.200', 4.5, 'Card and field content when a component steps onto the raised surface.'],
  ['text', 'Supporting text on site canvas', 'ink.muted', 'surface.100', 4.5, 'Secondary copy such as intros, captions and helper text.'],
  ['text', 'Supporting text on raised surface', 'ink.muted', 'surface.200', 4.5, 'Card bodies, palette tiles, hints and the bands that sit on surface-200.'],
  ['text', 'Placeholder text in fields', 'ink.placeholder', 'surface.200', 4.5, 'Example values inside inputs, which sit on the raised surface.'],
  ['text', 'Links and accents on site canvas', 'accent', 'surface.100', 4.5, 'Inline links, eyebrows and stat values on the page background.'],
  ['text', 'Links and accents on raised surface', 'accent', 'surface.200', 4.5, 'Links and accent text inside cards and bands.'],
  ['text', 'Primary button label', 'accent.ink', 'accent', 4.5, 'Default primary action styling.'],
  ['text', 'Primary button label on hover', 'accent.ink', 'accent.strong', 4.5, 'Hover state for the primary action.'],
  ['text', 'Positive status on raised surface', 'positive', 'surface.200', 4.5, 'Success status inside cards, e.g. the scorecard.'],
  ['text', 'Info status on raised surface', 'info', 'surface.200', 4.5, 'Neutral guidance or sample-only notes inside cards.'],
  ['text', 'Warning status on raised surface', 'warning', 'surface.200', 4.5, 'Non-blocking cautions inside cards, e.g. open items on the scorecard.'],
  ['text', 'Critical status on raised surface', 'critical', 'surface.200', 4.5, 'Errors, failures and destructive actions only.'],
  ['functional', 'Control border on site canvas', 'border.control', 'surface.100', 3, 'Input, secondary button and switch-track outlines on the page background.'],
  ['functional', 'Control border on raised surface', 'border.control', 'surface.200', 3, 'Input and secondary button outlines on the raised surface.'],
  ['functional', 'Focus ring on site canvas', 'focusRing', 'surface.100', 3, 'Visible focus indicator against the main page background.'],
  ['functional', 'Focus ring on raised surface', 'focusRing', 'surface.200', 3, 'Visible focus indicator inside cards and bands.'],
]

// Stricter targets for the prefers-contrast: more token set: WCAG AAA for
// text and 4.5:1 for control borders and focus rings.
export const highContrastMinimum = { text: 7, functional: 4.5 }

export const verifiedPairings = pairingRows.map(([category, title, foreground, background, minimum, note]) => (
  { category, title, foreground, background, minimum, note }
))

export const publicTokenScope = {
  spacing: Object.entries(spacingTokens).map(([token, value]) => ({ token, value })),
  radii: Object.entries(radiiTokens).map(([token, value]) => ({ token, value })),
  typography: {
    families: Object.entries(fontFamilyTokens).map(([token, value]) => ({ token, value })),
    sizes: Object.keys(fontSizeTokens).map((token) => ({
      token,
      fontSize: fontSizeTokens[token],
      lineHeight: lineHeightTokens[token],
    })),
  },
  layout: {
    primitives: [
      '`container()` — centered, capped at 1080px (override with `maxWidth`), inline padding of spacing `4`, then `6` from `md`.',
      '`stack()` — a flex column by default with a spacing-`4` gap; takes `direction`, `align`, `justify` and `gap`.',
      '`grid()` — `columns` (a number or responsive object) makes `minmax(0, 1fr)` tracks; `minChildWidth` (a CSS length) makes auto-fit tracks capped at 100%; default gap is spacing `4`.',
    ],
    inherited: [
      'Responsive rules use Panda defaults (`base`, `sm`, `md`, `lg`) because Verdant does not publish a custom breakpoint token scale.',
    ],
    pageSpecific: [
      'Hero wordmark: 56px at base and 88px from `md` upward; this is page artwork, not a reusable type token.',
      'Components and 404 page titles: 40px at base and 56px from `md` upward; also page-specific, not public tokens.',
    ],
  },
}
