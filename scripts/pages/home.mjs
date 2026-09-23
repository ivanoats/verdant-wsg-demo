// Home page sections, in render order: hero, measured stats, how it grows,
// palette + token scope, saved WSG evidence, PandaCSS, and the CTA band.
import { css } from '../../styled-system/css/index.mjs'
import { flex, vstack, hstack, grid } from '../../styled-system/patterns/index.mjs'
import { card } from '../../styled-system/recipes/index.mjs'
import { heroArt, stageGlyph, leafRow, seedlingArt } from '../art.mjs'
import { themeTokenCount, highContrastTokens, themeTokens } from 'verdant-design/theme'
import { paletteSections, verifiedPairings, publicTokenScope, highContrastMinimum } from 'verdant-design/tokens'
import { COMPONENTS_ROUTE, GREEN_WEB_ROUTE, REPO, WSG, WSG_CHECK, evidenceRecord } from '../config.mjs'
import { contrast, formatRatio } from '../lib/contrast.mjs'
import { escapeHtml } from '../lib/html.mjs'
import {
  bandCss, btnPrimary, btnRowCss, btnSecondary, codeCss, eyebrowCss,
  h2Css, introCss, sectionCss, tokenCode, wrapCss,
} from '../styles.mjs'


const heroCss = css({
  display: 'grid', gap: { base: '6', md: '8' }, alignItems: 'center',
  gridTemplateColumns: { base: '1fr', md: '1fr 1fr' },
  paddingTop: { base: '8', md: '12' }, paddingBottom: { base: '8', md: '12' },
})
const heroTitleCss = css({ fontSize: { base: '56px', md: '88px' }, lineHeight: '0.95', fontWeight: '700', letterSpacing: '-0.02em', margin: '0' })
const heroTagCss = css({ fontSize: { base: 'displaySm', md: 'displayMd' }, lineHeight: { base: 'displaySm', md: 'displayMd' }, fontWeight: '600', color: 'accent', margin: '16px 0 0', maxWidth: '22ch' })
const heroLedeCss = css({ color: 'ink.muted', margin: '16px 0 0', maxWidth: '52ch' })
const heroArtCss = css({ '& svg': { display: 'block', width: '100%', height: 'auto', maxWidth: '560px', marginInline: 'auto' } })

export const heroHtml = `
<section class="${wrapCss}" aria-labelledby="hero-title">
  <div class="${heroCss}">
    <div>
      <p class="${eyebrowCss}">A design system for the <a href="${WSG}">W3C Web Sustainability Guidelines</a></p>
      <h1 id="hero-title" class="${heroTitleCss}">Verdant</h1>
      <p class="${heroTagCss}">Sustainable Defaults for the Green Web</p>
      <p class="${heroLedeCss}">Start with the parts teams usually add later: system fonts, a System/Light/Dark theme preference, restrained motion, and only the CSS each page uses. Verdant gives a product page or docs site those lighter defaults from the first commit.</p>
      <div class="${btnRowCss}">
        <a class="${btnPrimary}" href="${COMPONENTS_ROUTE}">Browse components</a>
        <a class="${btnSecondary}" href="${GREEN_WEB_ROUTE}">What is the green web?</a>
      </div>
    </div>
    <div class="${heroArtCss}">${heroArt()}</div>
  </div>
</section>`

// ---- index: measured stats (filled in by scripts/stats.mjs after fingerprinting)

const statsGridCss = grid({ columns: { base: 2, md: 4 }, gap: { base: '6', md: '8' }, margin: '0', paddingBlock: '8' })
const statCss = css({ display: 'flex', flexDirection: 'column-reverse', margin: '0' })
const statValueCss = css({ fontSize: { base: 'displayMd', sm: 'displayLg', md: '40px' }, lineHeight: { base: 'displayMd', sm: 'displayLg', md: '48px' }, fontWeight: '700', color: 'accent', margin: '0' })
const statLabelCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '4px 0 0' })
const statsNoteCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '0 0 8px' })

export const statsHtml = `
<section class="${bandCss}" aria-label="By the numbers">
  <div class="${wrapCss}">
    <dl class="${statsGridCss}">
      <div class="${statCss}"><dt class="${statLabelCss}">Initial render assets, local Brotli estimate</dt><dd class="${statValueCss}">__INITIAL_RENDER_KIB__&nbsp;KiB</dd></div>
      <div class="${statCss}"><dt class="${statLabelCss}">Offline shell + worker, unique local Brotli estimate</dt><dd class="${statValueCss}">__OFFLINE_SHELL_KIB__&nbsp;KiB</dd></div>
      <div class="${statCss}"><dt class="${statLabelCss}">Cold first session, measured local transfer</dt><dd class="${statValueCss}">__COLD_SESSION_KIB__&nbsp;KiB</dd></div>
      <div class="${statCss}"><dt class="${statLabelCss}">Warm repeat visit, measured local transfer</dt><dd class="${statValueCss}">__WARM_SESSION_KIB__&nbsp;KiB</dd></div>
    </dl>
    <p class="${statsNoteCss}">Measured __MEASURED_ON__ locally over HTTP with Brotli response bodies in KiB (1024 bytes), excluding headers, then rounded up to a stable tenth for this summary. Cold includes the service worker install and its duplicate precache fetches; warm is a repeat visit with the shell already cached. Production-network transfer is unmeasured here.</p>
  </div>
</section>`

// ---- index: how it grows ----------------------------------------------------------

const stagesCss = grid({ columns: { base: 1, sm: 2, lg: 4 }, listStyle: 'none', margin: '0', padding: '0' })
const stageCss = card()
const stageGlyphCss = css({ display: 'block', marginBottom: '3' })
const stageStepCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'ink.muted', margin: '0' })
const stageTitleCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '4px 0 8px' })
const stageBodyCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '0' })

const stages = [
  ['seed', 'Seed', 'Tokens', `${themeTokenCount} colors, a 4px spacing grid, four radii and system type. Small enough to stay consistent without one-off values.`],
  ['sprout', 'Sprout', 'Components', 'Button, card, field, theme preference, switch specimen and motion &mdash; each one demonstrates a WSG behavior live instead of describing it.'],
  ['sapling', 'Sapling', 'Pages', 'A product page or docs page gets landmarks, a skip link, one focus ring, one stylesheet and two small same-origin scripts from day one.'],
  ['canopy', 'Canopy', 'Sites', 'Security headers, cache rules, an offline shell and a real 404 &mdash; the hosting checks, handled before launch.'],
]
export const stagesHtml = `
<section class="${wrapCss} ${sectionCss}" aria-labelledby="grows-title">
  <p class="${eyebrowCss}">How it grows</p>
  <h2 id="grows-title" class="${h2Css}">From a small token set to a whole site.</h2>
  <p class="${introCss}">Each layer only adds the parts the previous one cannot, which keeps the finished site small.</p>
  <ol class="${stagesCss}">
    ${stages.map(([key, stage, layer, body], i) => `
    <li class="${stageCss}">
      <span class="${stageGlyphCss}">${stageGlyph[key]}</span>
      <p class="${stageStepCss}">${i + 1} &middot; ${stage}</p>
      <h3 class="${stageTitleCss}">${layer}</h3>
      <p class="${stageBodyCss}">${body}</p>
    </li>`).join('')}
  </ol>
</section>`

// ---- index: palette, pairings and token scope --------------------------------------

const paletteGridCss = grid({ columns: { base: 1, lg: 2 }, listStyle: 'none', margin: '0', padding: '0' })
const swatchCardCss = card()
const swatchNameCss = css({ fontFamily: 'mono', fontSize: 'bodySm', lineHeight: 'bodySm', fontWeight: '600', margin: '0' })
const swatchThemeGridCss = grid({ columns: { base: 1, sm: 2 }, gap: '3', marginTop: '3' })
const swatchThemeTileCss = css({
  display: 'grid', gridTemplateColumns: '48px 1fr', gap: '3', alignItems: 'center',
  border: '1px solid', borderColor: 'border', borderRadius: 'sm', padding: '3', background: 'surface.100',
})
const swatchThemeLabelCss = css({ display: 'block', fontSize: 'label', lineHeight: 'label', fontWeight: '600', margin: '0' })
const hexInlineCss = css({ fontFamily: 'mono', fontSize: 'label' })
const highContrastListCss = css({ margin: '0', paddingLeft: '20px', listStyle: 'disc', color: 'ink.muted', fontSize: 'bodySm', lineHeight: 'bodySm', '& li + li': { marginTop: '2' } })
const swatchHexCss = css({ display: 'block', fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', color: 'ink.muted', marginTop: '4px' })
const pairingGridCss = grid({ columns: { base: 1, lg: 2 }, listStyle: 'none', margin: '0', padding: '0' })
const pairingCardCss = card()
const pairingTitleCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '0' })
const pairingTokenCss = css({ fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', margin: '8px 0 0' })
const pairingBodyCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '8px 0 0' })
const pairingMetaCss = css({ fontSize: 'label', lineHeight: 'label', color: 'ink.muted', margin: '12px 0 0' })
const levelBadgeCss = css({
  display: 'inline-block', marginInlineStart: '1', paddingInline: '2', border: '1px solid', borderColor: 'border.control',
  borderRadius: 'full', fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'ink', whiteSpace: 'nowrap',
})
const scopeGridCss = grid({ columns: { base: 1, lg: 2 } })
const scopeCardCss = card()
const scopeTitleCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '0 0 8px' })
const scopeBodyCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '0 0 12px' })
const scopeListCss = css({ margin: '0', paddingLeft: '20px', color: 'ink.muted', '& li + li': { marginTop: '2' } })
const scopeCodeCss = css({ fontFamily: 'mono', fontSize: 'label', lineHeight: 'label', color: 'ink' })
const paletteGroupCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '0 0 4px' })
const paletteGroupNoteCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '0 0 20px', maxWidth: '68ch' })
const paletteGapCss = css({ marginTop: '12' })

const leafSwatch = (fill, stroke) => `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M8 40V14c0-3.3 2.7-6 6-6h26v26c0 3.3-2.7 6-6 6H8Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`
const swatchTile = (themeLabel, fill, stroke) => `
        <div class="${swatchThemeTileCss}">
          ${leafSwatch(fill, stroke)}
          <span><span class="${swatchThemeLabelCss}">${themeLabel}</span><span class="${swatchHexCss}">${fill}</span></span>
        </div>`
const themeValueMaps = {
  light: Object.fromEntries(Object.entries(themeTokens).map(([key, value]) => [key, value.light])),
  dark: Object.fromEntries(Object.entries(themeTokens).map(([key, value]) => [key, value.dark])),
}

const swatches = (keys) => keys.map((key) => {
  const token = themeTokens[key]
  return `
      <li class="${swatchCardCss}">
        <p class="${swatchNameCss}">${key}</p>
        <div class="${swatchThemeGridCss}">
          ${swatchTile('Light', token.light, themeValueMaps.light.border)}
          ${swatchTile('Dark', token.dark, themeValueMaps.dark.border)}
        </div>
      </li>`
}).join('')

const evaluatedPairings = verifiedPairings.map((pairing) => {
  const lightContrast = contrast(themeValueMaps.light[pairing.foreground], themeValueMaps.light[pairing.background])
  const darkContrast = contrast(themeValueMaps.dark[pairing.foreground], themeValueMaps.dark[pairing.background])
  if (lightContrast < pairing.minimum || darkContrast < pairing.minimum) {
    throw new Error(`Verified pairing failed ${pairing.title}: ${formatRatio(lightContrast)} light / ${formatRatio(darkContrast)} dark`)
  }
  return { ...pairing, lightContrast, darkContrast }
})
// WCAG 2.2 levels, reported from the same ratios the build enforces. Text:
// AAA at 7:1, AA at 4.5:1 (1.4.6 / 1.4.3). Borders and focus rings follow
// 1.4.11, which has a single 3:1 non-text threshold and no AAA level.
const wcagLevel = (category, ratio) => {
  if (category === 'functional') return ratio >= 3 ? '3:1 non-text' : 'Below 3:1'
  if (ratio >= 7) return 'AAA'
  return ratio >= 4.5 ? 'AA' : 'Below AA'
}
const levelBadge = (category, ratio) => `<span class="${levelBadgeCss}">WCAG ${wcagLevel(category, ratio)}</span>`
const textPairings = evaluatedPairings.filter((pairing) => pairing.category === 'text')
const aaaBothThemes = textPairings.filter((pairing) => Math.min(pairing.lightContrast, pairing.darkContrast) >= 7).length

// prefers-contrast: more swaps in highContrastTokens; every pairing must then
// clear the stricter targets in both themes, or the build fails.
const highContrastMaps = {
  light: { ...themeValueMaps.light, ...Object.fromEntries(Object.entries(highContrastTokens).map(([key, value]) => [key, value.light])) },
  dark: { ...themeValueMaps.dark, ...Object.fromEntries(Object.entries(highContrastTokens).map(([key, value]) => [key, value.dark])) },
}
const highContrastPairings = verifiedPairings.map((pairing) => {
  const minimum = highContrastMinimum[pairing.category]
  const lightContrast = contrast(highContrastMaps.light[pairing.foreground], highContrastMaps.light[pairing.background])
  const darkContrast = contrast(highContrastMaps.dark[pairing.foreground], highContrastMaps.dark[pairing.background])
  if (lightContrast < minimum || darkContrast < minimum) {
    throw new Error(`High-contrast pairing failed ${pairing.title}: ${formatRatio(lightContrast)} light / ${formatRatio(darkContrast)} dark (needs ${minimum}:1)`)
  }
  return { ...pairing, minimum, lightContrast, darkContrast }
})
const lowestHighContrastText = Math.min(...highContrastPairings
  .filter((pairing) => pairing.category === 'text')
  .flatMap((pairing) => [pairing.lightContrast, pairing.darkContrast]))
const highContrastRows = Object.entries(highContrastTokens).map(([key, value]) => `
      <li>${tokenCode(key)} &mdash; Light <span class="${hexInlineCss}">${themeTokens[key].light}</span> &rarr; <span class="${hexInlineCss}">${value.light}</span> &middot; Dark <span class="${hexInlineCss}">${themeTokens[key].dark}</span> &rarr; <span class="${hexInlineCss}">${value.dark}</span></li>`).join('')
const pairingGroups = [
  {
    key: 'text',
    title: 'Verified text pairings',
    note: `Measured from the shared theme tokens at build time. These are the approved readable combinations — not every token can be mixed freely. ${aaaBothThemes} of ${textPairings.length} reach WCAG AAA (7:1) in both themes; every one meets AA (4.5:1), which also makes it AAA for large text. The build fails below the stated target, and AAA is reported, not required.`,
  },
  {
    key: 'functional',
    title: 'Verified functional boundaries',
    note: 'Borders and focus indicators target at least 3:1 non-text contrast against the surfaces they appear on.',
  },
]
const pairingCards = (category) => evaluatedPairings
  .filter((pairing) => pairing.category === category)
  .map((pairing) => `
      <li class="${pairingCardCss}">
        <h4 class="${pairingTitleCss}">${pairing.title}</h4>
        <p class="${pairingTokenCss}">${tokenCode(pairing.foreground)} on ${tokenCode(pairing.background)}</p>
        <p class="${pairingBodyCss}">${pairing.note}</p>
        <p class="${pairingMetaCss}">Light ${formatRatio(pairing.lightContrast)} ${levelBadge(pairing.category, pairing.lightContrast)} &middot; Dark ${formatRatio(pairing.darkContrast)} ${levelBadge(pairing.category, pairing.darkContrast)} &middot; Target ${pairing.minimum}:1</p>
      </li>`).join('')

const tokenList = (items) => items.map((item) => `<code class="${scopeCodeCss}">${item}</code>`).join(', ')
// Backtick spans in token-scope copy become <code> elements.
const inlineCode = (text) => text.replace(/`([^`]+)`/g, (_, code) => `<code class="${scopeCodeCss}">${code}</code>`)
const scopeList = (items) => items.map((item) => `<li>${item}</li>`).join('')
const typographyList = publicTokenScope.typography.sizes
  .map(({ token, fontSize, lineHeight }) => `<li><code class="${scopeCodeCss}">${token}</code> &mdash; ${fontSize} / ${lineHeight}</li>`)
  .join('')

export const paletteHtml = `
<section id="palette" class="${bandCss}" aria-labelledby="palette-title">
  <div class="${wrapCss} ${sectionCss}">
    <p class="${eyebrowCss}">Palette</p>
    <h2 id="palette-title" class="${h2Css}">${themeTokenCount} colors, shown in both themes.</h2>
    <p class="${introCss}">One token set with a light and a dark value each. System mode follows <code class="${codeCss}">prefers-color-scheme</code>; explicit Light and Dark choices reuse the same tokens without a second stylesheet. Both values of every token are shown side by side.</p>
    ${paletteSections.map((section, index) => `
    <h3 class="${paletteGroupCss}${index ? ` ${paletteGapCss}` : ''}">${section.title}</h3>
    <p class="${paletteGroupNoteCss}">${section.note}</p>
    <ul class="${paletteGridCss}">${swatches(section.keys)}</ul>`).join('')}
    ${pairingGroups.map(({ key, title, note }) => `
    <h3 class="${paletteGroupCss} ${paletteGapCss}">${title}</h3>
    <p class="${paletteGroupNoteCss}">${note}</p>
    <ul class="${pairingGridCss}">${pairingCards(key)}</ul>`).join('')}
    <h3 class="${paletteGroupCss} ${paletteGapCss}">Increased contrast</h3>
    <p class="${paletteGroupNoteCss}">When the operating system asks for more contrast (<code class="${codeCss}">prefers-contrast: more</code>), ${Object.keys(highContrastTokens).length} tokens switch to stronger values in either theme, control borders thicken to 2px and the focus ring to 3px. The build checks every pairing above against stricter targets in that mode: ${highContrastMinimum.text}:1 for text (the weakest is ${formatRatio(lowestHighContrastText)}) and ${highContrastMinimum.functional}:1 for control borders and focus rings.</p>
    <ul class="${highContrastListCss}">${highContrastRows}
    </ul>
  </div>
</section>`

export const tokensHtml = `
<section class="${wrapCss} ${sectionCss}" aria-labelledby="tokens-title">
  <p class="${eyebrowCss}">Public token scope</p>
  <h2 id="tokens-title" class="${h2Css}">What Verdant publishes, inherits, and keeps page-specific.</h2>
  <p class="${introCss}">The palette above defines the supported color API. These cards document the rest of the token surface so adopters can tell reusable design tokens from Panda defaults and demo-only layout values.</p>
  <div class="${scopeGridCss}">
    <section class="${scopeCardCss}">
      <h3 class="${scopeTitleCss}">Colors</h3>
      <p class="${scopeBodyCss}">Interface colors are the public text, control and status tokens. Illustration colors stay public for artwork only.</p>
      <ul class="${scopeListCss}">
        <li>Interface: ${tokenList(paletteSections[0].keys)}</li>
        <li>Illustration only: ${tokenList(paletteSections[1].keys)}</li>
      </ul>
    </section>
    <section class="${scopeCardCss}">
      <h3 class="${scopeTitleCss}">Spacing</h3>
      <p class="${scopeBodyCss}">Public spacing tokens follow a 4px rhythm.</p>
      <ul class="${scopeListCss}">${scopeList(publicTokenScope.spacing.map(({ token, value }) => `<code class="${scopeCodeCss}">${token}</code> &mdash; ${value}`))}</ul>
    </section>
    <section class="${scopeCardCss}">
      <h3 class="${scopeTitleCss}">Radii</h3>
      <p class="${scopeBodyCss}">Rounded corners stay on four reusable steps.</p>
      <ul class="${scopeListCss}">${scopeList(publicTokenScope.radii.map(({ token, value }) => `<code class="${scopeCodeCss}">${token}</code> &mdash; ${value}`))}</ul>
    </section>
    <section class="${scopeCardCss}">
      <h3 class="${scopeTitleCss}">Typography</h3>
      <p class="${scopeBodyCss}">System fonts plus six public size/line-height pairs. If a brand needs its own typeface, follow the <a href="${REPO}#custom-web-fonts-the-off-ramp">web-font off-ramp</a>: self-hosted, subset WOFF2 with a CI byte budget.</p>
      <ul class="${scopeListCss}">
        ${scopeList(publicTokenScope.typography.families.map(({ token, value }) => `<code class="${scopeCodeCss}">${token}</code> &mdash; ${value}`))}
        ${typographyList}
      </ul>
    </section>
    <section class="${scopeCardCss}">
      <h3 class="${scopeTitleCss}">Layout &amp; breakpoints</h3>
      <p class="${scopeBodyCss}">Three layout primitives cover page structure; responsive and page-art values are called out separately. See the <a href="${COMPONENTS_ROUTE}#layout-specimen-title">layout specimen</a>.</p>
      <ul class="${scopeListCss}">
        ${scopeList(publicTokenScope.layout.primitives.map(inlineCode))}
        ${scopeList(publicTokenScope.layout.inherited.map(inlineCode))}
        ${scopeList(publicTokenScope.layout.pageSpecific.map(inlineCode))}
      </ul>
    </section>
  </div>
</section>`

// ---- index: saved WSG evidence --------------------------------------------------

const scoreListCss = grid({ columns: { base: 1, md: 2 }, listStyle: 'none', margin: '0', padding: '0' })
const scoreItemCss = card()
const scoreHeadCss = flex({ justify: 'space-between', align: 'baseline', gap: '3', wrap: 'wrap' })
const scoreTitleCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', margin: '0' })
const scorePassCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'positive', margin: '0' })
const scoreOpenCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'warning', margin: '0' })
const scorePendingCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'ink.muted', margin: '0' })
const scoreBodyCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '8px 0 0' })
const scoreMetaCss = css({ fontSize: 'label', lineHeight: 'label', color: 'ink.muted', margin: '8px 0 0' })
const scoreNoteCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', marginTop: '6', maxWidth: '70ch' })
const scoreLinksCss = css({ fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink.muted', margin: '16px 0 0', maxWidth: '70ch' })

const statusCopy = {
  verified: { label: '&#10003; Verified', word: 'verified', css: scorePassCss },
  open: { label: '&#9888; Open', word: 'open', css: scoreOpenCss },
  'not-assessed': { label: '&#9675; Not assessed', word: 'not assessed', css: scorePendingCss },
  'not-applicable': { label: '&#8212; Not applicable', word: 'not applicable', css: scorePendingCss },
}
const statusOf = (entry) => statusCopy[entry.status] || statusCopy['not-assessed']
const linkSummary = (records = []) => records.map((record) => `<a href="${record.href}">${record.label}</a>`).join(', ')
// Every status the record can hold is counted, in a fixed order, so the
// summary always adds up to the number of cards below it.
const statusSummary = Object.keys(statusCopy)
  .map((key) => [key, evidenceRecord.entries.filter((entry) => statusOf(entry) === statusCopy[key]).length])
  .filter(([, count]) => count)
  .map(([key, count]) => `${count} ${statusCopy[key].word}`)
  .join(', ')
export const scoreHtml = `
<section class="${wrapCss} ${sectionCss}" aria-labelledby="score-title">
  <p class="${eyebrowCss}">Saved evidence record</p>
  <h2 id="score-title" class="${h2Css}">Implementation checklist for selected WSG-aligned defaults.</h2>
  <p class="${introCss}">${evidenceRecord.title} reviewed on ${evidenceRecord.reviewed_on} (${statusSummary}). This section is generated from a saved artifact, not a live deploy audit, and it documents selected evidence rather than full WSG conformance.</p>
  <p class="${scoreLinksCss}">Linked records: ${linkSummary(evidenceRecord.related_records)}</p>
  <ul class="${scoreListCss}">
    ${evidenceRecord.entries.map((entry) => `
    <li class="${scoreItemCss}">
      <div class="${scoreHeadCss}">
        <h3 class="${scoreTitleCss}">${entry.scanner_category}</h3>
        <p class="${statusOf(entry).css}">${statusOf(entry).label}</p>
      </div>
      <p class="${scoreBodyCss}">${entry.summary}</p>
      <p class="${scoreMetaCss}">Reviewed ${entry.date} &middot; ${evidenceRecord.wsg_edition.label} &middot; ${entry.wsg_refs.length ? `WSG refs ${entry.wsg_refs.join(', ')}` : 'No WSG section claimed'}</p>
      <p class="${scoreMetaCss}">Scope: ${entry.scope}</p>
      <p class="${scoreMetaCss}">${entry.tool.version ? `Tool: ${entry.tool.name} (${entry.tool.version})` : `Tool: ${entry.tool.name}`} &middot; <a href="${entry.evidence_link}">Evidence link</a></p>
      ${entry.linked_records?.length ? `<p class="${scoreMetaCss}">Linked records: ${linkSummary(entry.linked_records)}</p>` : ''}
    </li>`).join('')}
  </ul>
  <p class="${scoreNoteCss}">The card headings follow <a href="${WSG_CHECK}">wsg-check</a>'s scanner categories, not the WSG section structure. Status is always a word plus a symbol, never color alone, and the full record is also available as <a href="/wsg-evidence.json">JSON</a>.</p>
</section>`

// ---- index: PandaCSS ------------------------------------------------------------

const pandaGridCss = css({ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1.2fr' }, gap: { base: '6', md: '12' }, alignItems: 'start' })
const preCss = css({
  fontFamily: 'mono', fontSize: 'label', lineHeight: '20px', margin: '0',
  background: 'surface.100', color: 'ink', border: '1px solid', borderColor: 'border',
  borderRadius: 'md', padding: '4', overflowX: 'auto',
})
const listCss = css({ margin: '0', paddingLeft: '20px', listStyle: 'disc', color: 'ink.muted', '& li + li': { marginTop: '2' } })
const pandaSnippet = `// panda.config.ts
conditions: {
  dark: '@media (prefers-color-scheme: dark)',
},
theme: { extend: { semanticTokens: { colors: {
  accent: { value: { base: '#2f6b4a', _dark: '#7fcfa3' } },
  // …the other ${themeTokenCount - 1}, same shape
} } } },
// No staticCss: ship only the rules pages use.`

export const pandaHtml = `
<section class="${bandCss}" aria-labelledby="panda-title">
  <div class="${wrapCss} ${sectionCss}">
    <div class="${pandaGridCss}">
      <div>
        <p class="${eyebrowCss}">Built with PandaCSS</p>
        <h2 id="panda-title" class="${h2Css}">Tokens in, only-what-you-use CSS out.</h2>
        <p class="${introCss}">Verdant fits in one <a href="https://panda-css.com">PandaCSS</a> config. Build-time extraction keeps the stylesheet tied to what the page actually renders.</p>
        <ul class="${listCss}">
          <li>Semantic tokens carry both themes; <code class="${codeCss}">_dark</code> maps to the OS preference.</li>
          <li>Recipes for button, card, field and switch mirror the component guidelines.</li>
          <li>No runtime CSS-in-JS reaches the browser.</li>
        </ul>
      </div>
      <pre class="${preCss}" tabindex="0" aria-label="Example panda.config.ts"><code>${escapeHtml(pandaSnippet)}</code></pre>
    </div>
  </div>
</section>`

// ---- index: CTA band --------------------------------------------------------------

const ctaCss = css({ background: 'accent', color: 'accent.ink', position: 'relative', overflow: 'hidden' })
const ctaInnerCss = css({ position: 'relative', paddingBlock: { base: '12', md: '16' } })
const ctaTitleCss = css({ fontSize: { base: 'displayMd', md: 'displayLg' }, lineHeight: { base: 'displayMd', md: 'displayLg' }, fontWeight: '700', margin: '0', maxWidth: '22ch' })
const ctaBodyCss = css({ margin: '12px 0 0', maxWidth: '56ch' })
const ctaBtnCss = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', fontSize: 'bodySm', lineHeight: 'bodySm', fontWeight: '600', letterSpacing: '0.02em',
  paddingBlock: '3', paddingInline: '4', borderRadius: 'md', textDecoration: 'none',
  background: 'accent.ink', color: 'accent', border: '1px solid', borderColor: 'accent.ink',
  _hover: { color: 'accent.strong' },
  _focusVisible: { outline: '2px solid', outlineColor: 'accent.ink', outlineOffset: '3px' },
})
const ctaLinkCss = css({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', fontSize: 'bodySm', lineHeight: 'bodySm', fontWeight: '600', letterSpacing: '0.02em',
  paddingBlock: '3', paddingInline: '4', borderRadius: 'md', textDecoration: 'none',
  color: 'accent.ink', border: '1px solid', borderColor: 'accent.ink',
  _hover: { color: 'accent.ink', textDecoration: 'underline' },
  _focusVisible: { outline: '2px solid', outlineColor: 'accent.ink', outlineOffset: '3px' },
})
const ctaArtCss = css({ position: 'absolute', right: '0', bottom: '0', width: '600px', maxWidth: '100%', pointerEvents: 'none', '& svg': { display: 'block', width: '100%', height: 'auto' } })

export const ctaHtml = `
<section class="${ctaCss}" aria-labelledby="cta-title">
  <div class="${ctaArtCss}">${leafRow()}</div>
  <div class="${wrapCss} ${ctaInnerCss}">
    <h2 id="cta-title" class="${ctaTitleCss}">Use it in your next project.</h2>
    <p class="${ctaBodyCss}">Clone the repo, copy <code class="${codeCss}">panda.config.ts</code>, and keep the checklist. Start with the defaults, then layer in only the styling your product needs.</p>
    <div class="${btnRowCss}">
      <a class="${ctaBtnCss}" href="${REPO}">Get the source</a>
      <a class="${ctaLinkCss}" href="${COMPONENTS_ROUTE}">See the components</a>
    </div>
  </div>
</section>`

