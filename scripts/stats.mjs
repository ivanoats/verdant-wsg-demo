// Post-build: measure what the homepage actually costs and print it on the
// page, so the numbers in the stats band are never hand-typed or stale.
// Sizes are Brotli (quality 11), the encoding Netlify serves these files with.
import { readFileSync, writeFileSync } from 'node:fs'
import { brotliCompressSync, constants } from 'node:zlib'

const br = (path) =>
  brotliCompressSync(readFileSync(path), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length

// Baseline first view: the HTML, stylesheet and one deferred script. These
// bytes stay the same whether or not the browser supports prefers-reduced-data.
const coreFiles = ['dist/index.html', 'dist/styles.css', 'dist/sw-register.js']
// Supporting browsers may fetch install/chrome extras separately.
const optionalFiles = ['dist/favicon.svg', 'dist/manifest.json']
// The offline shell lands after the first load if service workers are supported.
const offlineFiles = ['dist/index.html', 'dist/components.html', 'dist/404.html', 'dist/styles.css', 'dist/sw-register.js', 'dist/theme-toggle.js']
const kb = (bytes) => (bytes / 1024).toFixed(1)
const total = (files) => files.reduce((sum, f) => sum + br(f), 0)

const html = readFileSync('dist/index.html', 'utf8')
const coreBytes = total(coreFiles)
const optionalBytes = total(optionalFiles)
const offlineBytes = total(offlineFiles)

writeFileSync('dist/index.html', html
  .replace('__CORE_KB__', kb(coreBytes))
  .replace('__OPTIONAL_KB__', kb(optionalBytes))
  .replace('__OFFLINE_KB__', kb(offlineBytes))
  .replace('__CORE_REQS__', String(coreFiles.length))
  .replace('__OPTIONAL_REQS__', String(optionalFiles.length))
  .replace('__OFFLINE_REQS__', String(offlineFiles.length)))

console.log(`Baseline first view: ${kb(coreBytes)} KB (br) across ${coreFiles.length} requests; optional browser extras ${kb(optionalBytes)} KB across ${optionalFiles.length} requests; offline shell install ${kb(offlineBytes)} KB across ${offlineFiles.length} files`)
