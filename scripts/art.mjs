// Verdant's "geometric growth" art. Everything is inline SVG built from the
// system's own shapes — a lens-shaped leaf (two arcs), rounded-rect stems,
// the 4px dot grid as soil — and every fill is a color token class, so the
// art recolors with the theme for free and costs a few hundred bytes
// compressed. No image requests, no raster files.
import { css } from '../styled-system/css/index.mjs'

// ---- tone classes (token-bound fills) ------------------------------------
export const tone = {
  accent: css({ fill: 'accent' }),
  strong: css({ fill: 'accent.strong' }),
  positive: css({ fill: 'positive' }),
  sun: css({ fill: 'focusRing' }),
  soil: css({ fill: 'border' }),  // earth-brown in both themes
  dot: css({ fill: 'surface.200' }),
  onAccent: css({ fill: 'accent.ink' }),
  panel: css({ fill: 'accent' }),
}
const veinCss = css({ fill: 'none', stroke: 'surface.100', strokeWidth: '2px', strokeLinecap: 'round', opacity: '0.4' })
const veinOnAccentCss = css({ fill: 'none', stroke: 'accent', strokeWidth: '1.5px', strokeLinecap: 'round' })

// ---- one-time grow-in, only for people who haven't asked for less motion.
// Each delay is its own literal call so Panda can extract it statically.
// No infinite loops: the art grows once and then holds still (WSG 2.17).
const leafGrow = [
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 150ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 350ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 550ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 700ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 850ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 1000ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 1150ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 640ms cubic-bezier(.2,.8,.2,1) 1300ms both' } }),
]
const stemGrow = [
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'stemGrow 520ms cubic-bezier(.2,.8,.2,1) 50ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'stemGrow 700ms cubic-bezier(.2,.8,.2,1) 300ms both' } }),
]
const sunRise = css({ _motionSafe: { animation: 'sunRise 900ms cubic-bezier(.2,.8,.2,1) 0ms both' } })

// A lens leaf of length L, base at the origin, pointing along +x.
const leafD = (L) => {
  const r = +(L * 0.72).toFixed(1)
  return `M0 0A${r} ${r} 0 0 1 ${L} 0A${r} ${r} 0 0 1 0 0Z`
}
const leaf = ({ x, y, len, angle, fill, grow = '', vein = true, veinClass = veinCss }) =>
  `<g transform="translate(${x} ${y}) rotate(${angle})"><g class="${grow}">` +
  `<path class="${fill}" d="${leafD(len)}"/>` +
  (vein ? `<path class="${veinClass}" d="M${+(len * 0.14).toFixed(1)} 0H${+(len * 0.74).toFixed(1)}"/>` : '') +
  `</g></g>`

const dots = ({ x0, x1, ys, pitch = 32, r = 3, fill }) => {
  let out = ''
  for (const y of ys) for (let x = x0; x <= x1; x += pitch) out += `<circle class="${fill}" cx="${x}" cy="${y}" r="${r}"/>`
  return out
}

// ---- hero: seed -> seedling -> plant, under the one signal-amber sun -----
export const heroArt = () => `
<svg viewBox="0 0 520 420" width="520" height="420" aria-hidden="true" focusable="false">
  <circle class="${tone.sun} ${sunRise}" cx="440" cy="84" r="48"/>
  <rect class="${tone.soil}" x="24" y="340" width="472" height="80" rx="16"/>
  ${dots({ x0: 48, x1: 472, ys: [364, 396], fill: tone.dot })}

  <circle class="${tone.strong}" cx="72" cy="329" r="11"/>
  ${leaf({ x: 76, y: 320, len: 18, angle: -62, fill: tone.positive, grow: leafGrow[0], vein: false })}

  <rect class="${tone.strong} ${stemGrow[0]}" x="146" y="286" width="8" height="54" rx="4"/>
  ${leaf({ x: 150, y: 290, len: 46, angle: 206, fill: tone.positive, grow: leafGrow[1] })}
  ${leaf({ x: 150, y: 290, len: 46, angle: -26, fill: tone.accent, grow: leafGrow[1] })}

  <rect class="${tone.strong} ${stemGrow[1]}" x="314" y="104" width="12" height="236" rx="6"/>
  ${leaf({ x: 320, y: 306, len: 92, angle: 196, fill: tone.accent, grow: leafGrow[2] })}
  ${leaf({ x: 320, y: 264, len: 96, angle: -16, fill: tone.positive, grow: leafGrow[3] })}
  ${leaf({ x: 320, y: 220, len: 82, angle: 200, fill: tone.positive, grow: leafGrow[4] })}
  ${leaf({ x: 320, y: 180, len: 72, angle: -24, fill: tone.accent, grow: leafGrow[5] })}
  ${leaf({ x: 320, y: 144, len: 58, angle: 208, fill: tone.accent, grow: leafGrow[6] })}
  ${leaf({ x: 320, y: 110, len: 52, angle: -90, fill: tone.positive, grow: leafGrow[7] })}
</svg>`

// ---- the mark: one leaf on an accent tile. Used in the header and footer.
export const mark = (size = 28) => `
<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <rect class="${tone.panel}" width="32" height="32" rx="8"/>
  ${leaf({ x: 8, y: 24, len: 22, angle: -45, fill: tone.onAccent, veinClass: veinOnAccentCss })}
</svg>`

// ---- growth-stage glyphs (48×48): tokens -> components -> pages -> sites
const ground = `<rect class="${tone.soil}" x="6" y="40" width="36" height="4" rx="2"/>`
export const stageGlyph = {
  seed: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ground}
    <circle class="${tone.strong}" cx="24" cy="33" r="7"/>
    ${leaf({ x: 26, y: 27, len: 12, angle: -62, fill: tone.positive, vein: false })}</svg>`,
  sprout: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ground}
    <rect class="${tone.strong}" x="22" y="24" width="4" height="16" rx="2"/>
    ${leaf({ x: 24, y: 26, len: 17, angle: 206, fill: tone.positive, vein: false })}
    ${leaf({ x: 24, y: 26, len: 17, angle: -26, fill: tone.accent, vein: false })}</svg>`,
  sapling: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ground}
    <rect class="${tone.strong}" x="22" y="10" width="4" height="30" rx="2"/>
    ${leaf({ x: 24, y: 32, len: 16, angle: 200, fill: tone.accent, vein: false })}
    ${leaf({ x: 24, y: 24, len: 15, angle: -20, fill: tone.positive, vein: false })}
    ${leaf({ x: 24, y: 17, len: 13, angle: 205, fill: tone.positive, vein: false })}
    ${leaf({ x: 24, y: 12, len: 11, angle: -90, fill: tone.accent, vein: false })}</svg>`,
  canopy: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${ground}
    <rect class="${tone.strong}" x="21" y="24" width="6" height="16" rx="3"/>
    <circle class="${tone.accent}" cx="15" cy="22" r="9"/>
    <circle class="${tone.positive}" cx="33" cy="22" r="9"/>
    <circle class="${tone.strong}" cx="24" cy="14" r="10"/></svg>`,
}

// ---- a quiet row of leaves for the accent CTA band ----------------------
const bandLeaf = css({ fill: 'accent.ink', opacity: '0.18' })
export const leafRow = () => {
  let out = ''
  for (let i = 0; i < 9; i++) {
    const x = 24 + i * 64
    out += leaf({ x, y: i % 2 ? 44 : 60, len: 40, angle: i % 2 ? -30 : -60, fill: bandLeaf, vein: false })
  }
  return `<svg viewBox="0 0 600 80" width="600" height="80" aria-hidden="true" focusable="false">${out}</svg>`
}

// ---- 404 --------------------------------------------------------------
export const seedlingArt = () => `
<svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false">
  <rect class="${tone.soil}" x="8" y="96" width="144" height="24" rx="8"/>
  ${dots({ x0: 24, x1: 136, ys: [108], pitch: 16, r: 2, fill: tone.dot })}
  <circle class="${tone.strong}" cx="80" cy="87" r="9"/>
  ${leaf({ x: 83, y: 80, len: 18, angle: -62, fill: tone.positive, grow: leafGrow[0], vein: false })}
</svg>`
