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

export const verifiedPairings = [
  {
    category: 'text',
    title: 'Body text on site canvas',
    foreground: 'ink',
    background: 'surface.100',
    minimum: 4.5,
    note: 'Default long-form copy and labels on the page background.',
  },
  {
    category: 'text',
    title: 'Body text on raised surface',
    foreground: 'ink',
    background: 'surface.200',
    minimum: 4.5,
    note: 'Card and field content when a component steps onto the raised surface.',
  },
  {
    category: 'text',
    title: 'Supporting text on site canvas',
    foreground: 'ink.muted',
    background: 'surface.100',
    minimum: 4.5,
    note: 'Secondary copy such as intros, captions and helper text.',
  },
  {
    category: 'text',
    title: 'Primary button label',
    foreground: 'accent.ink',
    background: 'accent',
    minimum: 4.5,
    note: 'Default primary action styling.',
  },
  {
    category: 'text',
    title: 'Primary button label on hover',
    foreground: 'accent.ink',
    background: 'accent.strong',
    minimum: 4.5,
    note: 'Hover state for the primary action.',
  },
  {
    category: 'text',
    title: 'Positive status on site canvas',
    foreground: 'positive',
    background: 'surface.100',
    minimum: 4.5,
    note: 'Success messaging on the default page background.',
  },
  {
    category: 'text',
    title: 'Critical status on site canvas',
    foreground: 'critical',
    background: 'surface.100',
    minimum: 4.5,
    note: 'Warning or error messaging on the default page background.',
  },
  {
    category: 'functional',
    title: 'Default border on site canvas',
    foreground: 'border',
    background: 'surface.100',
    minimum: 3,
    note: 'Dividers and outlines on the page background.',
  },
  {
    category: 'functional',
    title: 'Default border on raised surface',
    foreground: 'border',
    background: 'surface.200',
    minimum: 3,
    note: 'Card, field and secondary button outlines on the raised surface.',
  },
  {
    category: 'functional',
    title: 'Focus ring on site canvas',
    foreground: 'focusRing',
    background: 'surface.100',
    minimum: 3,
    note: 'Visible focus indicator against the main page background.',
  },
]

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
    inherited: [
      'Responsive rules use Panda defaults (`base`, `sm`, `md`, `lg`) because Verdant does not publish a custom breakpoint token scale.',
    ],
    pageSpecific: [
      'Hero wordmark: 56px at base and 88px from `md` upward; this is page artwork, not a reusable type token.',
      'Components and 404 page titles: 40px at base and 56px from `md` upward; also page-specific, not public tokens.',
      'The shared page wrapper is capped at 1080px for this demo site layout.',
    ],
  },
}
