// Post-build: measure what the homepage actually costs and print it on the
// page, so the numbers in the stats band are never hand-typed or stale.
// Sizes are Brotli (quality 11), the encoding Netlify serves these files with.
import { readFileSync, writeFileSync } from 'node:fs'
import { brotliCompressSync, constants } from 'node:zlib'

const br = (path) =>
  brotliCompressSync(readFileSync(path), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length

// Everything a first visit to / downloads: the page, its stylesheet, its one
// script, the icon and the manifest. (sw.js installs after load and is left out.)
const homeFiles = ['dist/index.html', 'dist/styles.css', 'dist/sw-register.js', 'dist/favicon.svg', 'dist/manifest.json']
const kb = (bytes) => (bytes / 1024).toFixed(1)

const html = readFileSync('dist/index.html', 'utf8')
const homeBytes = homeFiles.reduce((sum, f) => sum + br(f), 0)
const cssBytes = br('dist/styles.css')

writeFileSync('dist/index.html', html.replace('__HOME_KB__', kb(homeBytes)).replace('__CSS_KB__', kb(cssBytes)))

console.log(`Homepage first load: ${kb(homeBytes)} KB (br) across ${homeFiles.length} files; styles.css ${kb(cssBytes)} KB (br)`)
