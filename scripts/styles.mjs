// Shared style bindings: the page chrome (header, nav, breadcrumb, footer),
// the common type/block scale, and the prose styles the article and status
// pages reuse. Every binding is a literal css()/pattern()/recipe() call so
// `panda cssgen` can still statically extract it (see panda.config.ts).
import { css } from '../styled-system/css/index.mjs'
import { flex, hstack, container } from '../styled-system/patterns/index.mjs'
import { button } from '../styled-system/recipes/index.mjs'

// ---- shell ------------------------------------------------------------------

export const skipLinkCss = css({
  position: 'absolute', left: '3', top: '-48px',
  background: 'surface.200', color: 'ink', paddingBlock: '2', paddingInline: '4',
  borderRadius: 'sm', border: '1px solid', borderColor: 'border.control', zIndex: '10', textDecoration: 'none',
  _motionSafe: { transition: 'top 120ms ease' },
  _focus: { top: '3' },
})
export const wrapCss = container()
export const headerCss = css({ borderBottom: '1px solid', borderColor: 'border' })
export const barCss = flex({ paddingBlock: '3', align: 'center', justify: 'space-between', gap: '4', wrap: 'wrap' })
export const wordmarkCss = hstack({ gap: '2', color: 'ink', textDecoration: 'none', fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '700' })
export const headerActionsCss = flex({ align: 'center', gap: '4', wrap: 'wrap' })
export const navListCss = hstack({ gap: { base: '3', md: '6' }, listStyle: 'none', margin: '0', padding: '0' })
export const navLinkCss = css({ textDecoration: 'none', fontSize: 'bodySm', fontWeight: '600', color: 'ink', _hover: { color: 'accent' } })
export const navLinkActiveCss = css({ textDecoration: 'underline', textUnderlineOffset: '6px', textDecorationThickness: '2px', fontSize: 'bodySm', fontWeight: '600', color: 'accent' })
export const themePrefCss = css({
  display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
  border: '0', margin: '0', padding: '0',
})
export const themePrefLegendCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', color: 'ink.muted', margin: '0', padding: '0' })
export const themePrefOptionCss = css({
  display: 'inline-flex', alignItems: 'center', gap: '2',
  paddingBlock: '1', paddingInline: '3', border: '1px solid', borderColor: 'border',
  borderRadius: 'full', background: 'surface.200', fontSize: 'label', lineHeight: 'label', fontWeight: '600',
})
export const themePrefRadioCss = css({ margin: '0', accentColor: 'accent' })

export const breadcrumbListCss = hstack({ gap: '1', listStyle: 'none', margin: '0', paddingTop: '3', paddingInline: '0', fontSize: 'label', color: 'ink.muted' })
export const breadcrumbLinkCss = css({ color: 'ink.muted', textDecoration: 'none' })

export const footerCss = css({ borderTop: '1px solid', borderColor: 'border' })
export const footerBarCss = flex({ paddingBlock: '6', align: 'center', justify: 'space-between', gap: '4', wrap: 'wrap' })
export const footerBrandCss = hstack({ gap: '2' })
export const footerTextCss = css({ color: 'ink.muted', fontSize: 'label', lineHeight: 'label', margin: '0' })
export const footerLinksCss = hstack({ gap: '4', listStyle: 'none', margin: '0', padding: '0', fontSize: 'label' })

// ---- shared type & blocks ------------------------------------------------------

export const sectionCss = css({ paddingBlock: { base: '12', md: '16' } })
export const bandCss = css({ background: 'surface.200', borderBlock: '1px solid', borderColor: 'border' })
export const eyebrowCss = css({ fontSize: 'label', lineHeight: 'label', fontWeight: '600', letterSpacing: '0.02em', color: 'accent', margin: '0 0 12px' })
export const h2Css = css({ fontSize: { base: 'displayMd', md: 'displayLg' }, lineHeight: { base: 'displayMd', md: 'displayLg' }, fontWeight: '700', margin: '0 0 12px', maxWidth: '24ch' })
export const introCss = css({ color: 'ink.muted', margin: '0 0 32px', maxWidth: '62ch' })
export const codeCss = css({ fontFamily: 'mono', fontSize: 'label' })
export const btnPrimary = button({ variant: 'primary' })
export const btnSecondary = button({ variant: 'secondary' })
export const btnRowCss = flex({ gap: '3', wrap: 'wrap', marginTop: '6' })


// Page title, lede and prose link — shared by the article and status pages.
export const compTitleCss = css({ fontSize: { base: '40px', md: '56px' }, lineHeight: '1', fontWeight: '700', letterSpacing: '-0.01em', margin: '0 0 16px' })
export const ledeCss = css({ color: 'ink.muted', maxWidth: '62ch', margin: '0' })
export const proseLinkCss = css({
  color: 'accent',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1.5px',
  _hover: { color: 'accent.strong' },
  _visited: { color: 'accent.strong' },
})

export const tokenCode = (token) => `<code class="${codeCss}">${token}</code>`
