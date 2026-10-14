type ThemeValues = Record<string, { light: string; dark: string }>
type ThemeModeVars = { light: Record<string, string>; dark: Record<string, string> }
type NestedSemanticTokens = {
  [key: string]: { value: { base: string; _dark: string } } | NestedSemanticTokens
}

export declare const themePreferenceStorageKey: string
export declare const themePreferenceControlName: string
export declare const themePreferenceValues: string[]
export declare const themePreferenceAttr: string
export declare const themeResolvedAttr: string
export declare const themeOverrideAttr: string
export declare const themeVarName: (name: string) => string
export declare const themeTokens: ThemeValues
export declare const semanticColorTokens: NestedSemanticTokens
export declare const explicitThemeVars: ThemeModeVars
export declare const themeTokenCount: number
export declare const highContrastTokens: ThemeValues
export declare const highContrastVars: ThemeModeVars
export declare const interfacePaletteOrder: string[]
export declare const illustrationPaletteOrder: string[]
