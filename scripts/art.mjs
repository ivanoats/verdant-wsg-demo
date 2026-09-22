// Verdant's art: a lush, geometric green valley. Everything is inline SVG
// built from a few shapes — a lens leaf (two arcs), circles for hills and
// canopies, rounded-rect stems — and every fill is a color token class, so
// the whole scene recolors with the theme (day valley / night valley) and
// costs no requests. The foliage.* tokens exist for exactly this.
import { css } from '../styled-system/css/index.mjs'

// ---- tone classes (token-bound fills) ----------------------------------------
export const tone = {
  far: css({ fill: 'foliage.far' }),
  mid: css({ fill: 'foliage.mid' }),
  leaf: css({ fill: 'foliage' }),
  deep: css({ fill: 'foliage.deep' }),
  bright: css({ fill: 'foliage.bright' }),
  sun: css({ fill: 'sunlight' }),
  halo: css({ fill: 'sunlight', opacity: '0.25' }),
  sky: css({ fill: 'surface.200' }),
  poppy: css({ fill: 'critical' }),
  onTile: css({ fill: 'surface.200' }),
}
const veinCss = css({ fill: 'none', stroke: 'surface.200', strokeWidth: '1.5px', strokeLinecap: 'round', opacity: '0.55' })
const veinOnTileCss = css({ fill: 'none', stroke: 'foliage', strokeWidth: '1.5px', strokeLinecap: 'round' })

// ---- one-time grow-in, only when motion is allowed (no loops, WSG 2.17).
// Every delay is its own literal call so Panda can extract it statically.
const rise = [
  css({ _motionSafe: { animation: 'hillRise 700ms cubic-bezier(.2,.8,.2,1) 0ms both' } }),
  css({ _motionSafe: { animation: 'hillRise 700ms cubic-bezier(.2,.8,.2,1) 120ms both' } }),
  css({ _motionSafe: { animation: 'hillRise 700ms cubic-bezier(.2,.8,.2,1) 240ms both' } }),
]
const growUp = [
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'sprout 720ms cubic-bezier(.2,.8,.2,1) 300ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'sprout 720ms cubic-bezier(.2,.8,.2,1) 420ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'sprout 720ms cubic-bezier(.2,.8,.2,1) 540ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'sprout 720ms cubic-bezier(.2,.8,.2,1) 660ms both' } }),
]
const leafGrow = [
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 500ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 600ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 700ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 800ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 900ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 1000ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 1100ms both' } }),
  css({ transformBox: 'fill-box', transformOrigin: '0% 50%', _motionSafe: { animation: 'leafGrow 560ms cubic-bezier(.2,.8,.2,1) 1200ms both' } }),
]
const stemGrow = css({ transformBox: 'fill-box', transformOrigin: '50% 100%', _motionSafe: { animation: 'stemGrow 600ms cubic-bezier(.2,.8,.2,1) 380ms both' } })
const sunRise = css({ _motionSafe: { animation: 'sunRise 900ms cubic-bezier(.2,.8,.2,1) 0ms both' } })

// ---- geometry helpers -------------------------------------------------------------

// Seeded PRNG so the "random" grass is identical on every build.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const r1 = (n) => +n.toFixed(1)

// A lens leaf of length L, base at the origin, pointing along +x.
const leafD = (L) => {
  const r = r1(L * 0.72)
  return `M0 0A${r} ${r} 0 0 1 ${L} 0A${r} ${r} 0 0 1 0 0Z`
}
// Standalone leaf (for small SVGs that can't share <defs>).
const leaf = ({ x, y, len, angle, fill, grow = '', vein = false, veinClass = veinCss }) =>
  `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(angle)})"><g class="${grow}">` +
  `<path class="${fill}" d="${leafD(len)}"/>` +
  (vein ? `<path class="${veinClass}" d="M${r1(len * 0.14)} 0H${r1(len * 0.74)}"/>` : '') +
  `</g></g>`
// Shared leaf: one unit path in <defs>, reused by <use> — keeps a scene with
// a couple hundred leaves to a few KB. `s` scales the 100-unit leaf.
const uleaf = (id, { x, y, len, angle, fill, grow = '', vein = false }) => {
  const s = r1(len) / 100
  const t = `translate(${r1(x)} ${r1(y)}) rotate(${r1(angle)}) scale(${+s.toFixed(3)})`
  const body = `<use href="#${id}" class="${fill}"/>` + (vein ? `<use href="#${id}v" class="${veinCss}"/>` : '')
  return grow ? `<g transform="${t}"><g class="${grow}">${body}</g></g>` : `<g transform="${t}">${body}</g>`
}
const leafDefs = (id) =>
  `<defs><path id="${id}" d="${leafD(100)}"/><path id="${id}v" d="M14 0H74" vector-effect="non-scaling-stroke"/></defs>`

// Cubic bezier helpers for placing grass along a hill's crest.
const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}
const crestY = (segs, x) => {
  let best = [0, 1e9]
  for (const s of segs) for (let i = 0; i <= 60; i++) {
    const p = bez(...s, i / 60)
    if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p
  }
  return best[1]
}

// A leafy burst: leaves fanning up from one base point (bushes, ferns).
const burst = (id, { x, y, n, spread = [-168, -12], len: [lo, hi], seed, vein = false, tones }) => {
  const rand = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const a = spread[0] + ((spread[1] - spread[0]) * i) / (n - 1) + (rand() - 0.5) * 10
    const centerBias = 1 - Math.abs(a + 90) / 90 // taller in the middle
    out += uleaf(id, { x, y, len: lo + (hi - lo) * (0.4 * rand() + 0.6 * centerBias), angle: a, fill: tones[i % tones.length], vein })
  }
  return out
}

// A canopy tree: trunk + overlapping circles, deep underneath, bright on top.
const tree = ({ x, y, s = 1, grow = '' }) => {
  const c = (dx, dy, r, t) => `<circle class="${t}" cx="${r1(x + dx * s)}" cy="${r1(y + dy * s)}" r="${r1(r * s)}"/>`
  return `<g class="${grow}">` +
    `<rect class="${tone.deep}" x="${r1(x - 7 * s)}" y="${r1(y - 110 * s)}" width="${r1(14 * s)}" height="${r1(112 * s)}" rx="${r1(7 * s)}"/>` +
    c(0, -150, 50, tone.deep) + c(-42, -118, 40, tone.deep) + c(42, -116, 42, tone.deep) +
    c(-30, -150, 36, tone.leaf) + c(34, -156, 38, tone.leaf) + c(0, -110, 34, tone.leaf) + c(0, -188, 34, tone.leaf) +
    c(-14, -176, 22, tone.bright) + c(28, -138, 20, tone.bright) + c(-40, -128, 16, tone.bright) + c(12, -206, 14, tone.bright) +
    `</g>`
}

// ---- hero: a verdant valley ----------------------------------------------------------
export const heroArt = () => {
  const L = 'vl'
  // Foreground hill crest (two cubic segments; the second is the S reflection).
  const segs = [
    [[0, 396], [90, 362], [180, 372], [280, 394]],
    [[280, 394], [380, 416], [470, 366], [560, 382]],
  ]
  const front = 'M0 396C90 362 180 372 280 394S470 366 560 382V440H0Z'

  // Dense grass along the crest.
  const rand = rng(7)
  let grass = ''
  for (let x = 2; x <= 558; x += 6.6) {
    const len = 14 + rand() * 22
    const angle = -90 + (rand() - 0.5) * 56
    const t = [tone.leaf, tone.bright, tone.deep, tone.bright][Math.floor(rand() * 4)]
    grass += uleaf(L, { x: x + rand() * 4, y: crestY(segs, x) + 3, len, angle, fill: t })
  }
  // Flowers scattered in the grass.
  const frand = rng(21)
  let flowers = ''
  for (const fx of [36, 118, 196, 268, 420, 468, 538]) {
    const fy = crestY(segs, fx) - 4 - frand() * 10
    flowers += `<circle class="${fx % 3 ? tone.sun : tone.poppy}" cx="${fx}" cy="${r1(fy)}" r="${r1(3 + frand() * 1.5)}"/>`
  }

  // Round shrubs dotted along the middle hills' crest.
  const onCircle = (cx, cy, r, x) => (Math.abs(x - cx) < r ? cy - Math.sqrt(r * r - (x - cx) ** 2) : Infinity)
  const midCrest = (x) => Math.min(onCircle(40, 646, 300, x), onCircle(440, 700, 372, x))
  let shrubs = ''
  for (const [sx, r] of [[196, 15], [222, 11], [292, 13], [418, 12], [446, 16], [540, 13]]) {
    const y = midCrest(sx) + 4
    shrubs += `<circle class="${tone.deep}" cx="${sx - r * 0.7}" cy="${r1(y - r * 0.5)}" r="${r1(r * 0.8)}"/>` +
      `<circle class="${tone.leaf}" cx="${sx + r * 0.5}" cy="${r1(y - r * 0.6)}" r="${r1(r * 0.85)}"/>` +
      `<circle class="${tone.bright}" cx="${sx}" cy="${r1(y - r)}" r="${r}"/>`
  }

  // The hero plant: a tall stem crowded with leaves.
  const px = 352, base = 400, top = 120
  let plant = `<rect class="${tone.deep} ${stemGrow}" x="${px - 5}" y="${top}" width="10" height="${base - top}" rx="5"/>`
  const n = 12
  for (let i = 0; i < n; i++) {
    const y = base - 26 - i * ((base - top - 40) / n)
    const len = 100 - i * 4.6
    const left = i % 2 === 0
    const angle = left ? 196 + i * 1.6 : -16 - i * 1.6
    plant += uleaf(L, { x: px, y, len, angle, fill: [tone.leaf, tone.bright, tone.deep][i % 3], grow: leafGrow[Math.min(7, Math.floor(i * 0.7))], vein: len > 60 })
  }
  plant += uleaf(L, { x: px, y: top + 6, len: 50, angle: -90, fill: tone.bright, grow: leafGrow[7], vein: true })
  plant += uleaf(L, { x: px, y: top + 14, len: 40, angle: -62, fill: tone.leaf, grow: leafGrow[7] })
  plant += uleaf(L, { x: px, y: top + 14, len: 40, angle: -118, fill: tone.leaf, grow: leafGrow[7] })

  return `
<svg viewBox="0 0 560 440" width="560" height="440" aria-hidden="true" focusable="false">
  ${leafDefs(L)}
  <clipPath id="vframe"><rect width="560" height="440" rx="28"/></clipPath>
  <rect class="${tone.sky}" width="560" height="440" rx="28"/>
  <g clip-path="url(#vframe)">
  <g class="${sunRise}"><circle class="${tone.halo}" cx="456" cy="84" r="66"/><circle class="${tone.sun}" cx="456" cy="84" r="44"/></g>

  <g class="${rise[0]}">
    <circle class="${tone.far}" cx="150" cy="560" r="310"/>
    <circle class="${tone.far}" cx="480" cy="600" r="330"/>
    ${tree({ x: 490, y: 274, s: 0.42 })}
    ${tree({ x: 530, y: 282, s: 0.3 })}
  </g>

  <g class="${rise[1]}">
    <circle class="${tone.mid}" cx="440" cy="700" r="372"/>
    <circle class="${tone.mid}" cx="40" cy="646" r="300"/>
    ${shrubs}
  </g>

  ${tree({ x: 122, y: 356, s: 1, grow: growUp[0] })}

  <g class="${growUp[1]}">${burst(L, { x: 250, y: 360, n: 9, len: [30, 58], seed: 3, tones: [tone.deep, tone.leaf, tone.bright] })}</g>

  ${plant}

  <g class="${rise[2]}">
    <path class="${tone.leaf}" d="${front}"/>
    ${grass}
    ${flowers}
  </g>

  <g class="${growUp[2]}">${burst(L, { x: 58, y: 410, n: 11, len: [36, 70], seed: 11, vein: true, tones: [tone.deep, tone.bright, tone.leaf] })}</g>
  <g class="${growUp[3]}">${burst(L, { x: 506, y: 404, n: 10, len: [32, 62], seed: 5, vein: true, tones: [tone.leaf, tone.deep, tone.bright] })}</g>
  </g>
</svg>`
}

// ---- the mark: one leaf on a foliage tile. Header, footer.
export const mark = (size = 28) => `
<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <rect class="${tone.leaf}" width="32" height="32" rx="8"/>
  ${leaf({ x: 8, y: 24, len: 22, angle: -45, fill: tone.onTile, vein: true, veinClass: veinOnTileCss })}
</svg>`

// ---- growth-stage glyphs (48×48): tokens -> components -> pages -> sites
const mound = `<ellipse class="${tone.mid}" cx="24" cy="44" rx="20" ry="6"/>`
export const stageGlyph = {
  seed: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${mound}
    <circle class="${tone.deep}" cx="24" cy="36" r="6"/>
    ${leaf({ x: 26, y: 31, len: 13, angle: -62, fill: tone.bright })}</svg>`,
  sprout: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${mound}
    <rect class="${tone.deep}" x="22" y="22" width="4" height="18" rx="2"/>
    ${leaf({ x: 24, y: 25, len: 18, angle: 204, fill: tone.bright })}
    ${leaf({ x: 24, y: 25, len: 18, angle: -24, fill: tone.leaf })}
    ${leaf({ x: 24, y: 23, len: 10, angle: -90, fill: tone.bright })}</svg>`,
  sapling: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${mound}
    <rect class="${tone.deep}" x="22" y="9" width="4" height="31" rx="2"/>
    ${leaf({ x: 24, y: 34, len: 17, angle: 198, fill: tone.leaf })}
    ${leaf({ x: 24, y: 29, len: 16, angle: -18, fill: tone.bright })}
    ${leaf({ x: 24, y: 23, len: 15, angle: 204, fill: tone.bright })}
    ${leaf({ x: 24, y: 18, len: 13, angle: -24, fill: tone.leaf })}
    ${leaf({ x: 24, y: 12, len: 11, angle: -90, fill: tone.bright })}</svg>`,
  canopy: `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">${mound}
    <rect class="${tone.deep}" x="21" y="24" width="6" height="16" rx="3"/>
    <circle class="${tone.deep}" cx="14" cy="24" r="9"/><circle class="${tone.deep}" cx="34" cy="24" r="9"/>
    <circle class="${tone.leaf}" cx="24" cy="15" r="11"/><circle class="${tone.leaf}" cx="16" cy="19" r="7"/>
    <circle class="${tone.bright}" cx="21" cy="11" r="5"/><circle class="${tone.bright}" cx="31" cy="19" r="5"/></svg>`,
}

// ---- a meadow along the bottom of the CTA band ---------------------------------
const meadowA = css({ fill: 'foliage.bright', opacity: '0.35' })
const meadowB = css({ fill: 'foliage.mid', opacity: '0.3' })
export const leafRow = () => {
  const L = 'mw'
  const rand = rng(42)
  let out = leafDefs(L)
  for (let x = 4; x < 600; x += 8.5) {
    out += uleaf(L, { x: x + rand() * 3, y: 118, len: 20 + rand() * 30, angle: -90 + (rand() - 0.5) * 60, fill: rand() > 0.5 ? meadowA : meadowB })
  }
  for (const [bx, sd] of [[120, 1], [330, 2], [520, 3]]) {
    const r = rng(sd)
    for (let i = 0; i < 9; i++) {
      out += uleaf(L, { x: bx, y: 118, len: 40 + r() * 34, angle: -165 + i * 18.75 + (r() - 0.5) * 8, fill: i % 2 ? meadowA : meadowB })
    }
  }
  return `<svg viewBox="0 0 600 120" width="600" height="120" aria-hidden="true" focusable="false">${out}</svg>`
}

// ---- 404: one seedling on an empty hill -----------------------------------------------
export const seedlingArt = () => `
<svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false">
  <ellipse class="${tone.mid}" cx="80" cy="126" rx="86" ry="30"/>
  <rect class="${tone.deep}" x="78" y="74" width="4" height="24" rx="2"/>
  ${leaf({ x: 80, y: 78, len: 20, angle: 204, fill: tone.bright, grow: leafGrow[0] })}
  ${leaf({ x: 80, y: 78, len: 20, angle: -24, fill: tone.leaf, grow: leafGrow[1] })}
</svg>`
