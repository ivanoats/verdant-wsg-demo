// The page shell every route renders into: header/nav, breadcrumb, footer,
// the service-worker update banner, and the <head> contract.
import { css } from '../styled-system/css/index.mjs'
import { hstack } from '../styled-system/patterns/index.mjs'
import { mark } from './art.mjs'
import { themePreferenceControlName, themePreferenceValues, themeTokens } from '@sustainablewebsites/verdant-design/theme'
import { COMPONENTS_ROUTE, REPO, WSG_CHECK } from './config.mjs'
import {
  barCss, breadcrumbLinkCss, breadcrumbListCss, btnPrimary, btnSecondary,
  footerBarCss, footerBrandCss, footerCss, footerLinksCss, footerTextCss,
  headerActionsCss, headerCss, navLinkActiveCss, navLinkCss, navListCss,
  skipLinkCss, themePrefCss, themePrefLegendCss, themePrefOptionCss,
  themePrefRadioCss, wordmarkCss, wrapCss,
} from './styles.mjs'

const nav = (active) => {
  const link = (key, href, label) =>
    `<li><a class="${active === key ? navLinkActiveCss : navLinkCss}" href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a></li>`
  const themeOption = (value, label) => `
          <label class="${themePrefOptionCss}" for="theme-pref-${value}">
            <input class="${themePrefRadioCss}" type="radio" id="theme-pref-${value}" name="${themePreferenceControlName}" value="${value}"${value === themePreferenceValues[0] ? ' checked' : ''}>
            <span>${label}</span>
          </label>`
  return `
  <header class="${headerCss}">
    <div class="${wrapCss} ${barCss}">
      <a class="${wordmarkCss}" href="/">${mark(28)}<span>Verdant</span></a>
      <div class="${headerActionsCss}">
        <nav aria-label="Primary">
          <ul class="${navListCss}">
            ${link('components', COMPONENTS_ROUTE, 'Components')}
            ${link('palette', '/#palette', 'Palette')}
            ${link('github', REPO, 'GitHub')}
          </ul>
        </nav>
        <fieldset class="${themePrefCss}" aria-label="Theme preference">
          <legend class="${themePrefLegendCss}">Theme</legend>
          ${themeOption('system', 'System')}
          ${themeOption('light', 'Light')}
          ${themeOption('dark', 'Dark')}
        </fieldset>
      </div>
    </div>
  </header>`
}

const breadcrumb = (label) => `
  <nav class="${wrapCss}" aria-label="Breadcrumb">
    <ol class="${breadcrumbListCss}">
      <li><a class="${breadcrumbLinkCss}" href="/">Home</a></li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">${label}</li>
    </ol>
  </nav>`

const footer = () => `
  <footer class="${footerCss}">
    <div class="${wrapCss} ${footerBarCss}">
      <div class="${footerBrandCss}">${mark(20)}<p class="${footerTextCss}">Verdant &mdash; built by Ivan with PandaCSS, with defaults aligned to selected Web Sustainability Guidelines.</p></div>
      <ul class="${footerLinksCss}">
        <li><a href="${WSG_CHECK}">wsg-check</a></li>
        <li><a href="${REPO}">Source</a></li>
      </ul>
    </div>
  </footer>`

const updateBannerCss = css({
  position: 'fixed',
  insetInline: { base: '4', md: '6' },
  bottom: { base: '4', md: '6' },
  zIndex: '10',
  maxWidth: '640px',
  marginInline: 'auto',
  padding: '4',
  background: 'surface.200',
  border: '1px solid',
  borderColor: 'border',
  borderRadius: 'md',
  boxShadow: 'md',
})
const updateBannerTextCss = css({ margin: '0', fontSize: 'bodySm', lineHeight: 'bodySm', color: 'ink' })
const updateBannerActionsCss = hstack({ gap: '3', marginTop: '3', flexWrap: 'wrap' })

const updateBanner = `
  <section id="sw-update" class="${updateBannerCss}" hidden aria-labelledby="sw-update-title" aria-live="polite" aria-atomic="true">
    <p id="sw-update-title" class="${updateBannerTextCss}">A fresh Verdant update is ready. Apply it when you&rsquo;re ready.</p>
    <div class="${updateBannerActionsCss}">
      <button id="sw-update-apply" type="button" class="${btnPrimary}">Update now</button>
      <button id="sw-update-dismiss" type="button" class="${btnSecondary}">Later</button>
    </div>
  </section>`

export const page = ({ title, description, path, active, crumb, jsonLd, bodyHtml, scripts = [] }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://verdant-wsg-demo.netlify.app${path}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${themeTokens['surface.100'].light}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${themeTokens['surface.100'].dark}" media="(prefers-color-scheme: dark)">
<script src="/theme-toggle.js"></script>
<link rel="stylesheet" href="/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
<a class="${skipLinkCss}" href="#main">Skip to content</a>
${nav(active)}
${crumb ? breadcrumb(crumb) : ''}
<main id="main">
${bodyHtml}
</main>
${footer()}
${updateBanner}
${['/sw-register.js', ...scripts].map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`

