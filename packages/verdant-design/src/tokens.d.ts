export declare const fontFamilyTokens: {
  sans: string
  mono: string
}

export declare const spacingTokens: Record<number, string>

export declare const radiiTokens: {
  sm: string
  md: string
  lg: string
  full: string
}

export declare const fontSizeTokens: {
  displayLg: string
  displayMd: string
  displaySm: string
  body: string
  bodySm: string
  label: string
}

export declare const lineHeightTokens: {
  displayLg: string
  displayMd: string
  displaySm: string
  body: string
  bodySm: string
  label: string
}

export declare const paletteSections: {
  title: string
  note: string
  keys: string[]
}[]

export declare const highContrastMinimum: {
  text: number
  functional: number
}

export declare const verifiedPairings: {
  category: string
  title: string
  foreground: string
  background: string
  minimum: number
  note: string
}[]

export declare const publicTokenScope: {
  spacing: { token: string; value: string }[]
  radii: { token: string; value: string }[]
  typography: {
    families: { token: string; value: string }[]
    sizes: { token: string; fontSize: string; lineHeight: string }[]
  }
  layout: {
    primitives: string[]
    inherited: string[]
    pageSpecific: string[]
  }
}
