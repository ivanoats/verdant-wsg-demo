// The /green-web article. The prose lives in content/green-web.md; this module
// supplies the Panda classes it renders into, so Panda can still statically
// extract every class the page uses.
import { readFileSync } from 'node:fs'
import { css } from '../../styled-system/css/index.mjs'
import { REPO, WSG } from '../config.mjs'
import { parseFrontmatter, renderMarkdown } from '../lib/markdown.mjs'
import {
  btnPrimary, btnRowCss, btnSecondary, compTitleCss, eyebrowCss, proseLinkCss, wrapCss,
} from '../styles.mjs'

const articleCss = css({ paddingBlock: { base: '8', md: '12' }, maxWidth: '68ch' })
const articleH2Css = css({ fontSize: 'displayMd', lineHeight: 'displayMd', fontWeight: '700', margin: '40px 0 12px' })
const articlePCss = css({ margin: '0 0 16px' })
const articleLeadCss = css({ fontSize: 'displaySm', lineHeight: 'displaySm', fontWeight: '600', color: 'accent', margin: '0 0 16px' })

const { data, body } = parseFrontmatter(readFileSync('content/green-web.md', 'utf8'))

const prose = renderMarkdown(body, {
  vars: { REPO, WSG },
  classes: { h2: articleH2Css, paragraph: articlePCss, lead: articleLeadCss, link: proseLinkCss },
})

const variants = { primary: btnPrimary, secondary: btnSecondary }
const actions = (data.actions ?? [])
  .map((a) => `<a class="${variants[a.variant]}" href="${a.href}">${a.label}</a>`)
  .join('')

export const greenWebMeta = data

export const greenWebBody = `
<article class="${wrapCss}" aria-labelledby="green-web-title">
  <div class="${articleCss}">
    <p class="${eyebrowCss}">${data.eyebrow}</p>
    <h1 id="green-web-title" class="${compTitleCss}">${data.title}</h1>
    ${prose}
    <div class="${btnRowCss}">${actions}</div>
  </div>
</article>`
