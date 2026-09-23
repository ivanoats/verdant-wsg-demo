export const themePreferenceStorageKey = 'verdant-theme-preference'
export const themePreferenceControlName = 'theme-preference'
export const themePreferenceValues = ['system', 'light', 'dark']
export const themePreferenceAttr = 'data-theme-preference'
export const themeResolvedAttr = 'data-theme-resolved'
export const themeOverrideAttr = 'data-theme-override'

export const themeVarName = (name) =>
  `--colors-${name.replace(/\./g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`

export const themeTokens = {
  'surface.100': { light: '#faf8f3', dark: '#15140f' },
  'surface.200': { light: '#ffffff', dark: '#1e1c15' },
  border: { light: '#c7bda9', dark: '#514b3b' },
  'border.control': { light: '#7f735b', dark: '#8f866f' },
  ink: { light: '#1c1a15', dark: '#f1ede2' },
  'ink.muted': { light: '#5b5548', dark: '#b6ae9c' },
  'ink.placeholder': { light: '#75726a', dark: '#8d8a81' },
  accent: { light: '#2f6b4a', dark: '#7fcfa3' },
  'accent.strong': { light: '#234f38', dark: '#5fb98c' },
  'accent.ink': { light: '#ffffff', dark: '#10241a' },
  focusRing: { light: '#a5670a', dark: '#e8a83e' },
  foliage: { light: '#3ca24a', dark: '#45ad55' },
  'foliage.far': { light: '#cdeaae', dark: '#1c3a22' },
  'foliage.mid': { light: '#9ed65f', dark: '#2d6b34' },
  'foliage.deep': { light: '#1f6a31', dark: '#2a7d3a' },
  'foliage.bright': { light: '#6fcd4f', dark: '#86dc62' },
  sunlight: { light: '#f4b63f', dark: '#e8a83e' },
  positive: { light: '#1f7a6c', dark: '#5cc9b7' },
  info: { light: '#2b5f8e', dark: '#8cbcea' },
  warning: { light: '#8a5a00', dark: '#f2c14e' },
  critical: { light: '#c1440e', dark: '#ff8f5e' },
}

const hasChildren = (key) => Object.keys(themeTokens).some((candidate) => candidate.startsWith(`${key}.`))

const nestToken = (root, key, value) => {
  const parts = key.includes('.') ? key.split('.') : hasChildren(key) ? [key, 'DEFAULT'] : [key]
  let cursor = root
  for (const part of parts.slice(0, -1)) {
    cursor[part] ||= {}
    cursor = cursor[part]
  }
  cursor[parts.at(-1)] = value
}

export const semanticColorTokens = Object.entries(themeTokens).reduce((colors, [name, value]) => {
  nestToken(colors, name, { value: { base: value.light, _dark: value.dark } })
  return colors
}, {})

const themeVarsFor = (mode) => Object.fromEntries(
  Object.entries(themeTokens).map(([name, value]) => [themeVarName(name), value[mode]])
)

export const explicitThemeVars = {
  light: themeVarsFor('light'),
  dark: themeVarsFor('dark'),
}

export const themeTokenCount = Object.keys(themeTokens).length

// Stronger values for people whose OS asks for more contrast
// (prefers-contrast: more). Only the tokens that carry supporting text,
// status, boundaries and focus change; ink and surfaces are already at the
// extremes. The build verifies these against stricter targets: 7:1 for text
// and 4.5:1 for control borders and focus rings.
export const highContrastTokens = {
  'ink.muted': { light: '#3f3a30', dark: '#d6cfbf' },
  'ink.placeholder': { light: '#4f4b42', dark: '#bdb8ab' },
  border: { light: '#7f735b', dark: '#8f866f' },
  'border.control': { light: '#4f4636', dark: '#b3a88e' },
  focusRing: { light: '#8a5200', dark: '#ffc15a' },
  accent: { light: '#245a3d', dark: '#9be0bb' },
  'accent.strong': { light: '#1a3f2c', dark: '#7fd0a5' },
  positive: { light: '#145e52', dark: '#7fdccb' },
  info: { light: '#1f4f7a', dark: '#a9cff2' },
  warning: { light: '#6e4700', dark: '#ffd57a' },
  critical: { light: '#922e08', dark: '#ffab85' },
}

const highContrastVarsFor = (mode) => Object.fromEntries(
  Object.entries(highContrastTokens).map(([name, value]) => [themeVarName(name), value[mode]])
)

export const highContrastVars = {
  light: highContrastVarsFor('light'),
  dark: highContrastVarsFor('dark'),
}

export const interfacePaletteOrder = [
  'accent',
  'accent.strong',
  'positive',
  'info',
  'warning',
  'critical',
  'focusRing',
  'accent.ink',
  'ink',
  'ink.muted',
  'ink.placeholder',
  'border',
  'border.control',
  'surface.200',
  'surface.100',
]

export const illustrationPaletteOrder = [
  'foliage.bright',
  'foliage',
  'foliage.deep',
  'foliage.mid',
  'foliage.far',
  'sunlight',
]
