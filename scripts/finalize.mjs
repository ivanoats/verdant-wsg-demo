import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync } from 'node:fs'
import { brotliCompressSync, constants } from 'node:zlib'

const DIST = 'dist'
const ASSETS = ['styles.css', 'site-ui.js', 'sw-register.js']
const PLACEHOLDERS = { home: '__HOME_KB__', css: '__CSS_KB__' }
const QUALITY = 11
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10)
const br = (buf) => brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: QUALITY } }).length
const kb = (bytes) => Number((bytes / 1024).toFixed(1))
const readDist = (file) => readFileSync(`${DIST}/${file}`)
const logicalFile = (url) => (url === '/' ? 'index.html' : url.slice(1))
const PAGES = readdirSync(DIST).filter((file) => file.endsWith('.html'))

mkdirSync(`${DIST}/assets`, { recursive: true })
const aliases = {}
for (const file of ASSETS) {
  const extIndex = file.lastIndexOf('.')
  const hashed = `assets/${file.slice(0, extIndex)}.${hash(readDist(file))}${file.slice(extIndex)}`
  renameSync(`${DIST}/${file}`, `${DIST}/${hashed}`)
  aliases[`/${file}`] = `/${hashed}`
}

for (const page of PAGES) {
  let html = readFileSync(`${DIST}/${page}`, 'utf8')
  for (const [from, to] of Object.entries(aliases)) html = html.split(`"${from}"`).join(`"${to}"`)
  writeFileSync(`${DIST}/${page}`, html)
}

const shell = ['/', '/components.html', '/404.html', '/offline.html', ...Object.values(aliases), '/favicon.svg', '/manifest.json']
const initialRender = ['/', aliases['/styles.css'], aliases['/site-ui.js'], aliases['/sw-register.js'], '/favicon.svg', '/manifest.json']
const offlineShell = [...shell, '/sw.js']
const firstSession = [...new Set([...initialRender, ...offlineShell])]
const replaceStats = (html, home, css) => html.replace(PLACEHOLDERS.home, home).replace(PLACEHOLDERS.css, css)
const assetBytes = (url, htmlOverride) => url === '/' && htmlOverride != null ? br(Buffer.from(htmlOverride)) : br(readDist(logicalFile(url)))
const totalBytes = (urls, htmlOverride) => [...new Set(urls)].reduce((sum, url) => sum + assetBytes(url, htmlOverride), 0)

const rawIndex = readFileSync(`${DIST}/index.html`, 'utf8')
let homeValue = '0.0'
let cssValue = '0.0'
for (let i = 0; i < 6; i += 1) {
  const html = replaceStats(rawIndex, homeValue, cssValue)
  const nextHome = kb(totalBytes(initialRender, html)).toFixed(1)
  const nextCss = kb(assetBytes(aliases['/styles.css'])).toFixed(1)
  if (nextHome === homeValue && nextCss === cssValue) break
  homeValue = nextHome
  cssValue = nextCss
}
writeFileSync(`${DIST}/index.html`, replaceStats(rawIndex, homeValue, cssValue))

const versionFiles = [...new Set(['index.html', ...PAGES.filter((page) => page !== 'index.html'), ...Object.values(aliases).map((url) => url.slice(1)), 'favicon.svg', 'manifest.json'])]
const version = hash(Buffer.concat(versionFiles.map((file) => readDist(file))))
const sw = readFileSync(`${DIST}/sw.js`, 'utf8').replace('__VERSION__', version).replace('__SHELL__', JSON.stringify(shell))
writeFileSync(`${DIST}/sw.js`, sw)

const files = Object.fromEntries([...new Set([...firstSession, '/components', '/404', '/offline'])].map((url) => {
  const canonical = url === '/components' ? '/components.html' : url === '/404' ? '/404.html' : url === '/offline' ? '/offline.html' : url
  return [url, { canonical, brotliBytes: assetBytes(canonical), brotliKiB: kb(assetBytes(canonical)) }]
}))
const report = {
  generatedAt: new Date().toISOString(),
  encoding: 'br',
  brotliQuality: QUALITY,
  runtime: { node: process.version },
  aliases,
  shell,
  summary: {
    initialRenderBrotliBytes: totalBytes(initialRender),
    initialRenderBrotliKiB: kb(totalBytes(initialRender)),
    offlineShellBrotliBytes: totalBytes(offlineShell),
    offlineShellBrotliKiB: kb(totalBytes(offlineShell)),
    firstSessionBrotliBytes: totalBytes(firstSession),
    firstSessionBrotliKiB: kb(totalBytes(firstSession)),
  },
  files,
  notes: {
    initialRender: 'Unique homepage requests needed for the first paint plus registered scripts and app metadata.',
    offlineShell: 'Unique precached shell files plus the production service worker.',
    firstSession: 'Unique cold-session requests for the homepage plus the production offline shell install for this static site.',
  },
}
writeFileSync(`${DIST}/asset-metrics.json`, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Fingerprinted ${ASSETS.length} assets; service worker version ${version}`)
console.log(`Measured homepage first render ${report.summary.initialRenderBrotliKiB.toFixed(1)} KiB br; offline shell ${report.summary.offlineShellBrotliKiB.toFixed(1)} KiB br`)
