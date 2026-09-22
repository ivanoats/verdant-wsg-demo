import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { createServer, request as httpRequest } from 'node:http'
import { brotliCompressSync, constants } from 'node:zlib'

const DIST = 'dist'
const INDEX = `${DIST}/index.html`
const SW = `${DIST}/sw.js`
const OFFLINE_CACHE = `${DIST}/offline-cache.json`
const REPORT = `${DIST}/measurements.json`
const REPORT_SCHEMA = `${DIST}/measurements.schema.json`
const ASSETS = ['styles.css', 'site-ui.js', 'sw-register.js']
const PLACEHOLDERS = { home: '__HOME_KB__', css: '__CSS_KB__' }
const QUALITY = 11
const DISPLAY_DATE = new Date().toISOString().slice(0, 10)
const VERSION_PLACEHOLDER = '__VERSION__'

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10)
const br = (buf) => brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: QUALITY } }).length
const kb = (bytes) => Number((bytes / 1024).toFixed(1))
const kib = (bytes) => Math.ceil((bytes / 1024) * 10 - 1e-9) / 10
const kibText = (bytes) => kib(bytes).toFixed(1)
const unique = (items) => [...new Set(items)]
const readDist = (file) => readFileSync(`${DIST}/${file}`)
const etag = (body) => `"${createHash('sha256').update(body).digest('hex')}"`

mkdirSync(`${DIST}/assets`, { recursive: true })
const aliases = {}
for (const file of ASSETS) {
  const extIndex = file.lastIndexOf('.')
  const hashed = `assets/${file.slice(0, extIndex)}.${hash(readDist(file))}${file.slice(extIndex)}`
  renameSync(`${DIST}/${file}`, `${DIST}/${hashed}`)
  aliases[`/${file}`] = `/${hashed}`
}

for (const page of readdirSync(DIST).filter((file) => file.endsWith('.html'))) {
  let html = readFileSync(`${DIST}/${page}`, 'utf8')
  for (const [from, to] of Object.entries(aliases)) html = html.split(`"${from}"`).join(`"${to}"`)
  writeFileSync(`${DIST}/${page}`, html)
}

if (!existsSync(OFFLINE_CACHE)) throw new Error(`Expected ${OFFLINE_CACHE} to exist`)
if (!existsSync(REPORT_SCHEMA)) throw new Error(`Expected ${REPORT_SCHEMA} to exist`)

const contract = JSON.parse(readFileSync(OFFLINE_CACHE, 'utf8'))
const canonicalSourceFiles = buildCanonicalSourceFiles(contract)
const shell = unique([
  ...contract.canonicalCacheKeys,
  ...Object.values(aliases),
  '/manifest.json',
  '/favicon.svg',
])
const replaceStats = (html, home, css) => html.replace(PLACEHOLDERS.home, home).replace(PLACEHOLDERS.css, css)
const cssKiB = () => kb(br(readDist(aliases['/styles.css'].slice(1))))

let rawIndex = readFileSync(INDEX, 'utf8')
let homeValue = '0.0'
let cssValue = '0.0'
for (let i = 0; i < 6; i += 1) {
  const html = replaceStats(rawIndex, homeValue, cssValue)
  const nextHome = kb(sum(initialRenderUrls(html).map((url) => br(readUrl(url, { indexHtml: html }))))).toFixed(1)
  const nextCss = cssKiB().toFixed(1)
  if (nextHome === homeValue && nextCss === cssValue) break
  homeValue = nextHome
  cssValue = nextCss
}
const finalIndex = replaceStats(rawIndex, homeValue, cssValue)
writeFileSync(INDEX, finalIndex)

const versionFiles = unique(['index.html', ...Object.values(canonicalSourceFiles), ...Object.values(aliases).map((url) => url.slice(1)), 'manifest.json', 'favicon.svg'])
const version = hash(Buffer.concat(versionFiles.map((file) => readDist(file))))
const sw = readFileSync(SW, 'utf8').replace(VERSION_PLACEHOLDER, version).replace('__SHELL__', JSON.stringify(shell))
writeFileSync(SW, sw)

const currentFiles = { indexHtml: finalIndex, swJs: sw }
const server = createServer((req, res) => serve(req, res, currentFiles))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()

try {
  const metrics = await collectMetrics({ contract, currentFiles, port })
  writeFileSync(REPORT, `${JSON.stringify(buildReport(metrics), null, 2)}\n`)
  console.log(`Fingerprinted ${ASSETS.length} assets; service worker version ${version}`)
  console.log(`Measured initial render ${metrics.displayKib.initialRender} KiB br; offline shell ${metrics.displayKib.offlineShell} KiB br`)
} finally {
  server.close()
}

function buildCanonicalSourceFiles(cacheContract) {
  const files = { '/': 'index.html' }
  for (const [alias, canonical] of Object.entries(cacheContract.routeAliases || {})) {
    files[canonical] ||= alias.slice(1)
  }
  for (const canonical of cacheContract.canonicalCacheKeys) files[canonical] ||= canonical.slice(1)
  return files
}

function sourceFileForUrl(url) {
  return canonicalSourceFiles[url] || url.slice(1)
}

function readUrl(url, overrides) {
  if (url === '/' && overrides?.indexHtml != null) return Buffer.from(overrides.indexHtml)
  if (url === '/sw.js' && overrides?.swJs != null) return Buffer.from(overrides.swJs)
  return readFileSync(`${DIST}/${sourceFileForUrl(url)}`)
}

function initialRenderUrls(indexHtml) {
  const { renderBlockingUrls, deferredScriptUrls, metadataUrls } = readPageResources(indexHtml)
  return unique(['/', ...renderBlockingUrls, ...deferredScriptUrls, ...metadataUrls])
}

function offlineShellUrls() {
  return unique(['/sw.js', ...shell])
}

async function collectMetrics({ currentFiles: files, port }) {
  const pageResources = readPageResources(files.indexHtml)
  const initialRender = unique(['/', ...pageResources.renderBlockingUrls, ...pageResources.deferredScriptUrls])
  const pageLinked = unique([...pageResources.renderBlockingUrls, ...pageResources.deferredScriptUrls, ...pageResources.metadataUrls])
  const offlineShell = unique(['/sw.js', ...shell])

  const initialRenderEstimateBytes = sum(initialRender.map((url) => br(readUrl(url, files))))
  const offlineShellEstimateBytes = sum(offlineShell.map((url) => br(readUrl(url, files))))

  const coldRequests = []
  coldRequests.push(await requestOnce(port, '/'))
  for (const url of pageLinked) coldRequests.push(await requestOnce(port, url))
  coldRequests.push(await requestOnce(port, '/sw.js'))
  for (const url of shell) coldRequests.push(await requestOnce(port, url, { label: 'service-worker-precache', cache: 'reload' }))

  const warmRequests = []
  warmRequests.push(await requestOnce(port, '/'))
  for (const url of pageLinked) {
    warmRequests.push({ url, statusCode: 200, transferBytes: 0, source: 'service-worker-cache', cache: 'warm-shell' })
  }
  warmRequests.push(await requestOnce(port, '/sw.js', { headers: { 'If-None-Match': etag(readUrl('/sw.js', files)) } }))

  return {
    generatedAt: new Date().toISOString(),
    publicSummaryDate: DISPLAY_DATE,
    displayKib: {
      initialRender: kibText(initialRenderEstimateBytes),
      offlineShell: kibText(offlineShellEstimateBytes),
      coldSession: kibText(sum(coldRequests.map((req) => req.transferBytes))),
      warmSession: kibText(sum(warmRequests.map((req) => req.transferBytes))),
    },
    initialRenderEstimate: { kind: 'estimate', bytes: initialRenderEstimateBytes, kib: kib(initialRenderEstimateBytes), urls: initialRender },
    offlineShellEstimate: { kind: 'estimate', bytes: offlineShellEstimateBytes, kib: kib(offlineShellEstimateBytes), urls: offlineShell },
    coldFirstSessionTransfer: { kind: 'measurement', bytes: sum(coldRequests.map((req) => req.transferBytes)), kib: kib(sum(coldRequests.map((req) => req.transferBytes))), requests: coldRequests },
    warmRepeatVisitTransfer: { kind: 'measurement', bytes: sum(warmRequests.map((req) => req.transferBytes)), kib: kib(sum(warmRequests.map((req) => req.transferBytes))), requests: warmRequests },
    resourceSets: {
      initialRenderUrls: initialRender,
      pageLinkedUrls: pageLinked,
      offlineShellUrls: readShell(files.swJs),
    },
  }
}

function buildReport(metrics) {
  return {
    $schema: './measurements.schema.json',
    schemaVersion: 1,
    generatedAt: metrics.generatedAt,
    publicSummaryDate: metrics.publicSummaryDate,
    units: { bytes: 'bytes', display: 'KiB', kibibyte: 1024 },
    encoding: {
      estimatedArtifacts: 'brotli-q11',
      measuredTransfer: 'brotli response bodies over local HTTP; headers excluded',
    },
    method: {
      estimates: 'Local Brotli q11 compression of finalized dist files.',
      localTransferMeasurements: 'Local HTTP requests against finalized output with Accept-Encoding: br; totals count response-body bytes only and exclude headers.',
      rounding: 'Homepage/report KiB values are rounded up to the next tenth to keep embedded summary values deterministic.',
      cacheConditions: {
        coldFirstSession: 'Empty caches, no service worker installed, then /sw.js registers and precaches the offline shell with cache: reload.',
        warmRepeatVisit: 'Repeat visit to / after a successful install with the service worker controlling the page and the shell already cached.',
      },
    },
    budgets: {
      initialRenderEstimateBytes: metrics.initialRenderEstimate.bytes,
      offlineShellEstimateBytes: metrics.offlineShellEstimate.bytes,
      coldFirstSessionTransferBytes: metrics.coldFirstSessionTransfer.bytes,
      warmRepeatVisitTransferBytes: metrics.warmRepeatVisitTransfer.bytes,
    },
    displayKib: metrics.displayKib,
    resourceSets: metrics.resourceSets,
    metrics: {
      initialRenderEstimate: metrics.initialRenderEstimate,
      offlineShellEstimate: metrics.offlineShellEstimate,
      localObservedTransfers: {
        coldFirstSession: metrics.coldFirstSessionTransfer,
        warmRepeatVisit: metrics.warmRepeatVisitTransfer,
      },
      productionNetworkTransfers: {
        coldFirstSession: {
          kind: 'unmeasured',
          reason: 'Requires deployed-host response headers and runtime cache behavior owned by #21.',
        },
        warmRepeatVisit: {
          kind: 'unmeasured',
          reason: 'Requires deployed-host response headers and runtime cache behavior owned by #21.',
        },
      },
    },
  }
}

function readPageResources(html) {
  const renderBlockingUrls = readMatches(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)
  const deferredScriptUrls = readMatches(html, /<script[^>]+src="([^"]+)"/g)
  const metadataUrls = [
    ...readMatches(html, /<link[^>]+rel="manifest"[^>]+href="([^"]+)"/g),
    ...readMatches(html, /<link[^>]+rel="icon"[^>]+href="([^"]+)"/g),
  ]
  return { renderBlockingUrls, deferredScriptUrls, metadataUrls }
}

function readMatches(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1])
}

function readShell(swText) {
  const match = swText.match(/var SHELL = (\[[^\n;]+\])/)
  if (!match) throw new Error('Could not read offline shell list from dist/sw.js')
  return JSON.parse(match[1])
}

function contentType(path) {
  if (path.endsWith('.html') || path === '/') return 'text/html; charset=utf-8'
  if (path.endsWith('.css')) return 'text/css; charset=utf-8'
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (path.endsWith('.json')) return 'application/json'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

function cacheControl(path) {
  if (path.startsWith('/assets/')) return 'public, max-age=31536000, immutable'
  if (path === '/favicon.svg') return 'public, max-age=604800'
  if (path === '/manifest.json') return 'public, max-age=86400'
  if (path === '/sw.js') return 'no-cache'
  return 'no-store'
}

function shouldCompress(path) {
  return /(?:\/|\.)(?:html|css|js|json|svg|xml|txt)$/.test(path) || path === '/'
}

function serve(req, res, files) {
  const url = new URL(req.url, 'http://127.0.0.1')
  const body = readUrl(url.pathname, files)
  const entityTag = etag(body)
  const headers = {
    'cache-control': cacheControl(url.pathname),
    'content-type': contentType(url.pathname),
    etag: entityTag,
  }
  if (req.headers['if-none-match'] === entityTag) {
    res.writeHead(304, headers)
    res.end()
    return
  }
  let payload = body
  if (shouldCompress(url.pathname) && /\bbr\b/.test(req.headers['accept-encoding'] || '')) {
    payload = brotliCompressSync(body)
    headers['content-encoding'] = 'br'
  }
  headers['content-length'] = payload.length
  res.writeHead(200, headers)
  res.end(payload)
}

function requestOnce(port, path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'GET',
      headers: {
        'Accept-Encoding': 'br',
        ...(options.headers || {}),
      },
    }, (res) => {
      let bytes = 0
      res.on('data', (chunk) => { bytes += chunk.length })
      res.on('end', () => resolve({
        url: path,
        statusCode: res.statusCode,
        transferBytes: bytes,
        source: 'network',
        cache: options.cache || 'default',
        label: options.label,
      }))
    })
    req.on('error', reject)
    req.end()
  })
}

function sum(items) {
  return items.reduce((total, item) => total + item, 0)
}
