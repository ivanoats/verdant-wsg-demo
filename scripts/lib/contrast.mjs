// WCAG relative-luminance contrast math, used to verify token pairings.
const hexToRgb = (hex) => [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset + 1, offset + 3), 16) / 255)
const relativeLuminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const contrast = (foreground, background) => {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}
export const formatRatio = (ratio) => `${ratio.toFixed(2)}:1`
