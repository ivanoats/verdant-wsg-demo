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

export const themeColorTokens = {
  'surface.100': { light: '#faf8f3', dark: '#15140f', kind: 'interface' },
  'surface.200': { light: '#ffffff', dark: '#1e1c15', kind: 'interface' },
  'border': { light: '#93866c', dark: '#726b53', kind: 'interface' },
  'ink': { light: '#1c1a15', dark: '#f1ede2', kind: 'interface' },
  'ink.muted': { light: '#5b5548', dark: '#b6ae9c', kind: 'interface' },
  'accent': { light: '#2f6b4a', dark: '#7fcfa3', kind: 'interface' },
  'accent.strong': { light: '#234f38', dark: '#5fb98c', kind: 'interface' },
  'accent.ink': { light: '#ffffff', dark: '#10241a', kind: 'interface' },
  'focusRing': { light: '#a5670a', dark: '#e8a83e', kind: 'interface' },
  'sunlight': { light: '#f4b63f', dark: '#e8a83e', kind: 'illustration' },
  'positive': { light: '#1f7a6c', dark: '#5cc9b7', kind: 'interface' },
  'critical': { light: '#c1440e', dark: '#ff8f5e', kind: 'interface' },
  'foliage': { light: '#3ca24a', dark: '#45ad55', kind: 'illustration' },
  'foliage.far': { light: '#cdeaae', dark: '#1c3a22', kind: 'illustration' },
  'foliage.mid': { light: '#9ed65f', dark: '#2d6b34', kind: 'illustration' },
  'foliage.deep': { light: '#1f6a31', dark: '#2a7d3a', kind: 'illustration' },
  'foliage.bright': { light: '#6fcd4f', dark: '#86dc62', kind: 'illustration' },
}

const tokenEntry = (token) => ({ value: { base: token.light, _dark: token.dark } })

const nestSemanticToken = (target, key, value) => {
  const parts = key.split('.')
  const hasChildren = Object.keys(themeColorTokens).some((candidate) => candidate.startsWith(`${parts[0]}.`))
  const path = parts.length === 1 && hasChildren ? [parts[0], 'DEFAULT'] : parts
  let node = target
  for (let i = 0; i < path.length - 1; i += 1) {
    const segment = path[i]
    node[segment] ||= {}
    node = node[segment]
  }
  node[path[path.length - 1]] = tokenEntry(value)
  return target
}

export const semanticColorTokens = Object.entries(themeColorTokens)
  .reduce((tokens, [key, value]) => nestSemanticToken(tokens, key, value), {})

export const runtimeThemeMaps = {
  light: Object.fromEntries(Object.entries(themeColorTokens).map(([key, value]) => [key, value.light])),
  dark: Object.fromEntries(Object.entries(themeColorTokens).map(([key, value]) => [key, value.dark])),
}

export const paletteSections = [
  {
    title: 'Interface',
    note: 'Public colors for text, controls and state. Use the verified pairings below rather than assuming every token combination is readable.',
    keys: ['accent', 'accent.strong', 'positive', 'focusRing', 'critical', 'accent.ink', 'ink', 'ink.muted', 'border', 'surface.200', 'surface.100'],
  },
  {
    title: 'Illustration only',
    note: 'Decorative foliage and sunlight tokens. They are available for art, but not approved as default text, controls, or status meaning.',
    keys: ['foliage.bright', 'foliage', 'foliage.deep', 'foliage.mid', 'foliage.far', 'sunlight'],
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
