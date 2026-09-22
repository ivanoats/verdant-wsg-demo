// Post-build: give every CSS/JS file a content-hashed name under /assets/,
// point the HTML at those names, and stamp the service worker with a
// version built from all shipped files.
//
// Why: the pages change on every deploy, but a file called /styles.css can
// sit in a browser (or service worker) cache from an older deploy. New HTML
// plus old CSS is a broken page. A hashed name changes whenever the content
// does, so a cached copy is always the right one — and can be cached for a
// year (see public/_headers).
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync } from 'node:fs'

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10)
const ASSETS = ['styles.css', 'sw-register.js', 'theme-toggle.js']
const PAGES = readdirSync('dist').filter((f) => f.endsWith('.html'))

mkdirSync('dist/assets', { recursive: true })
const map = {}
for (const file of ASSETS) {
  const [name, ext] = [file.slice(0, file.lastIndexOf('.')), file.slice(file.lastIndexOf('.'))]
  const hashed = `assets/${name}.${hash(readFileSync(`dist/${file}`))}${ext}`
  renameSync(`dist/${file}`, `dist/${hashed}`)
  map[`/${file}`] = `/${hashed}`
}

for (const page of PAGES) {
  let html = readFileSync(`dist/${page}`, 'utf8')
  for (const [from, to] of Object.entries(map)) html = html.split(`"${from}"`).join(`"${to}"`)
  writeFileSync(`dist/${page}`, html)
}

// Everything the offline shell caches, and a version that changes whenever
// any of it does — so every deploy ships a byte-different sw.js.
const shell = ['/', '/components.html', '/404.html', ...Object.values(map), '/favicon.svg', '/manifest.json']
const version = hash(Buffer.concat([...PAGES, ...Object.values(map).map((p) => p.slice(1)), 'favicon.svg', 'manifest.json']
  .map((f) => readFileSync(`dist/${f}`))))
const sw = readFileSync('dist/sw.js', 'utf8')
  .replace('__VERSION__', version)
  .replace('__SHELL__', JSON.stringify(shell))
writeFileSync('dist/sw.js', sw)

console.log(`Fingerprinted ${ASSETS.length} assets; service worker version ${version}`)
