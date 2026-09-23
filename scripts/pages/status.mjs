// The two status pages: 404 and the offline shell fallback.
import { vstack } from '../../styled-system/patterns/index.mjs'
import { seedlingArt } from '../art.mjs'
import { COMPONENTS_ROUTE } from '../config.mjs'
import { compTitleCss, ledeCss, wrapCss } from '../styles.mjs'

const nfCss = vstack({ gap: '4', alignItems: 'flex-start', paddingBlock: { base: '12', md: '16' } })
export const notFoundBody = `
<div class="${wrapCss} ${nfCss}">
  ${seedlingArt()}
  <h1 class="${compTitleCss}">Page not found</h1>
  <p class="${ledeCss}">Nothing has grown here yet. <a href="/">Back to the overview</a>, or <a href="${COMPONENTS_ROUTE}">browse the components</a>.</p>
</div>`

export const offlineBody = `
<div class="${wrapCss} ${nfCss}">
  ${seedlingArt()}
  <h1 class="${compTitleCss}">Offline for now</h1>
  <p class="${ledeCss}">This page isn&rsquo;t cached yet, and the network is out of reach. You can still open the <a href="/">overview</a> or the <a href="${COMPONENTS_ROUTE}">component gallery</a>, which are saved for offline use after installation.</p>
</div>`

