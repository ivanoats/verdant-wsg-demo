// Post-build: measure finalized artifacts, write a machine-readable report, and
// fill in the homepage summary with deterministic values.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer, request as httpRequest } from 'node:http'
import { brotliCompressSync, constants } from 'node:zlib'

const DIST = 'dist'
const INDEX = `${DIST}/index.html`
const SW = `${DIST}/sw.js`
const REPORT = `${DIST}/measurements.json`
const REPORT_SCHEMA = `${DIST}/measurements.schema.json`
const DISPLAY_DATE = new Date().toISOString().slice(0, 10)
const VERSION_PLACEHOLDER = '__VERSION__'
const PLACEHOLDERS = {
  initialRender: '__INITIAL_RENDER_KIB__',
  offlineShell: '__OFFLINE_SHELL_KIB__',
  coldSession: '__COLD_SESSION_KIB__',
  warmSession: '__WARM_SESSION_KIB__',
  measuredOn: '__MEASURED_ON__',
}
const br = (buf) =>
  brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length
const kib = (bytes) => Math.ceil((bytes / 1024) * 10 - 1e-9) / 10
const kibText = (bytes) => kib(bytes).toFixed(1)
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10)
const unique = (items) => [...new Set(items)]

const indexTemplate = readFileSync(INDEX, 'utf8')
const swTemplate = readFileSync(SW, 'utf8')

assertPlaceholders(indexTemplate, Object.values(PLACEHOLDERS))
if (!swTemplate.includes(VERSION_PLACEHOLDER)) throw new Error(`Expected ${SW} to include ${VERSION_PLACEHOLDER}`)
if (!existsSync(REPORT_SCHEMA)) throw new Error(`Expected ${REPORT_SCHEMA} to exist`)

const shellUrls = readShell(swTemplate)
if (!shellUrls.length) throw new Error('Offline shell list is empty')
for (const url of shellUrls) ensureUrlExists(url)
if (shellUrls.length !== unique(shellUrls).length) throw new Error('Offline shell list contains duplicate URLs')

const currentFiles = { indexHtml: indexTemplate, swJs: swTemplate }
const server = createServer((req, res) => serve(req, res, currentFiles))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()

try {
  let display = {
    initialRender: '0.0',
    offlineShell: '0.0',
    coldSession: '0.0',
    warmSession: '0.0',
  }
  let finalMetrics

  for (let i = 0; i < 8; i++) {
    const renderedIndex = renderIndex(indexTemplate, display)
    const renderedSw = renderSw(swTemplate, renderedIndex)
    currentFiles.indexHtml = renderedIndex
    currentFiles.swJs = renderedSw
    const measured = await collectMetrics({ indexHtml: renderedIndex, swJs: renderedSw, port, shellUrls })
    const next = maxDisplay(display, {
      initialRender: kibText(measured.initialRenderEstimate.bytes),
      offlineShell: kibText(measured.offlineShellEstimate.bytes),
      coldSession: kibText(measured.coldFirstSessionTransfer.bytes),
      warmSession: kibText(measured.warmRepeatVisitTransfer.bytes),
    })
    finalMetrics = measured
    if (JSON.stringify(next) === JSON.stringify(display)) break
    display = next
    if (i === 7) throw new Error('Homepage measurements did not converge to stable display values')
  }

  const finalIndex = renderIndex(indexTemplate, display)
  const finalSw = renderSw(swTemplate, finalIndex)
  currentFiles.indexHtml = finalIndex
  currentFiles.swJs = finalSw

  finalMetrics = await collectMetrics({ indexHtml: finalIndex, swJs: finalSw, port, shellUrls })
  finalMetrics.display = display
  const finalDisplay = maxDisplay(display, {
    initialRender: kibText(finalMetrics.initialRenderEstimate.bytes),
    offlineShell: kibText(finalMetrics.offlineShellEstimate.bytes),
    coldSession: kibText(finalMetrics.coldFirstSessionTransfer.bytes),
    warmSession: kibText(finalMetrics.warmRepeatVisitTransfer.bytes),
  })
  if (JSON.stringify(finalDisplay) !== JSON.stringify(display) || !coversMeasuredBytes(display, finalMetrics)) {
    throw new Error('Final measurements drifted beyond the stable public summary')
  }

  writeFileSync(INDEX, finalIndex)
  writeFileSync(SW, finalSw)
  writeFileSync(REPORT, JSON.stringify(buildReport(finalMetrics), null, 2) + '\n')

  assertNoPlaceholders(readFileSync(INDEX, 'utf8'))
  if (readFileSync(SW, 'utf8').includes(VERSION_PLACEHOLDER)) throw new Error(`Expected ${SW} to have a finalized version`)

  console.log([
    `Initial render estimate: ${display.initialRender} KiB (Brotli q11)`,
    `Offline shell + worker estimate: ${display.offlineShell} KiB (Brotli q11)`,
    `Cold first session transfer: ${display.coldSession} KiB measured locally`,
    `Warm repeat visit transfer: ${display.warmSession} KiB measured locally`,
    `Wrote ${REPORT}`,
  ].join('\n'))
} finally {
  server.close()
}

function renderIndex(template, display) {
  return template
    .replaceAll(PLACEHOLDERS.initialRender, display.initialRender)
    .replaceAll(PLACEHOLDERS.offlineShell, display.offlineShell)
    .replaceAll(PLACEHOLDERS.coldSession, display.coldSession)
    .replaceAll(PLACEHOLDERS.warmSession, display.warmSession)
    .replaceAll(PLACEHOLDERS.measuredOn, DISPLAY_DATE)
}

function renderSw(template, indexHtml) {
  const version = hash(Buffer.concat(shellUrls.map((url) => readUrl(url, { indexHtml, swJs: template }))))
  return template.replace(VERSION_PLACEHOLDER, version)
}

async function collectMetrics({ indexHtml, swJs, port, shellUrls }) {
  const pageResources = readPageResources(indexHtml)
  const initialRenderUrls = unique(['/', ...pageResources.renderBlockingUrls, ...pageResources.deferredScriptUrls])
  const offlineShellUrls = unique(['/sw.js', ...shellUrls])

  if (!initialRenderUrls.length) throw new Error('No initial render assets were detected')
  for (const url of initialRenderUrls) ensureUrlExists(url)
  for (const url of offlineShellUrls) ensureUrlExists(url)

  const initialRenderEstimate = {
    kind: 'estimate',
    bytes: sum(initialRenderUrls.map((url) => br(readUrl(url, { indexHtml, swJs })))),
    urls: initialRenderUrls,
  }

  const offlineShellEstimate = {
    kind: 'estimate',
    bytes: sum(offlineShellUrls.map((url) => br(readUrl(url, { indexHtml, swJs })))),
    urls: offlineShellUrls,
  }

  const coldRequests = []
  coldRequests.push(await requestOnce(port, '/'))
  for (const url of pageResources.pageLinkedUrls) {
    coldRequests.push(await requestOnce(port, url))
  }
  coldRequests.push(await requestOnce(port, '/sw.js'))
  for (const url of shellUrls) {
    coldRequests.push(await requestOnce(port, url, { label: 'service-worker-precache', cache: 'reload' }))
  }

  const warmRequests = []
  warmRequests.push(await requestOnce(port, '/'))
  for (const url of pageResources.pageLinkedUrls) {
    warmRequests.push({
      url,
      statusCode: 200,
      transferBytes: 0,
      source: 'service-worker-cache',
      cache: 'warm-shell',
    })
  }
  warmRequests.push(await requestOnce(port, '/sw.js', { headers: { 'If-None-Match': etag(readUrl('/sw.js', { indexHtml, swJs })) } }))

  return {
    measuredAt: new Date().toISOString(),
    displayDate: DISPLAY_DATE,
    encoding: {
      estimatedArtifacts: 'brotli-q11',
      measuredTransfer: 'brotli response bodies over local HTTP; headers excluded',
    },
    initialRenderEstimate: {
      ...initialRenderEstimate,
      kib: kib(initialRenderEstimate.bytes),
    },
    offlineShellEstimate: {
      ...offlineShellEstimate,
      kib: kib(offlineShellEstimate.bytes),
    },
    coldFirstSessionTransfer: {
      kind: 'measurement',
      bytes: sum(coldRequests.map((req) => req.transferBytes)),
      kib: kib(sum(coldRequests.map((req) => req.transferBytes))),
      requests: coldRequests,
    },
    warmRepeatVisitTransfer: {
      kind: 'measurement',
      bytes: sum(warmRequests.map((req) => req.transferBytes)),
      kib: kib(sum(warmRequests.map((req) => req.transferBytes))),
      requests: warmRequests,
    },
    assumptions: {
      coldFirstSession: 'Empty caches, no service worker installed, then /sw.js registers and precaches the offline shell with cache: reload.',
      warmRepeatVisit: 'Repeat visit to / after a successful install with the service worker controlling the page and the shell already cached.',
    },
    rounding: 'Homepage/report KiB values are rounded up to the next tenth to keep embedded summary values deterministic.',
    resourceSets: {
      initialRenderUrls,
      pageLinkedUrls: pageResources.pageLinkedUrls,
      offlineShellUrls,
    },
  }
}

function buildReport(metrics) {
  return {
    $schema: './measurements.schema.json',
    schemaVersion: 1,
    generatedAt: metrics.measuredAt,
    publicSummaryDate: metrics.displayDate,
    units: {
      bytes: 'bytes',
      display: 'KiB',
      kibibyte: 1024,
    },
    encoding: metrics.encoding,
    method: {
      estimates: 'Local Brotli q11 compression of finalized dist files.',
      localTransferMeasurements: 'Local HTTP requests against finalized output with Accept-Encoding: br; totals count response-body bytes only and exclude headers.',
      rounding: metrics.rounding,
      cacheConditions: metrics.assumptions,
    },
    budgets: {
      initialRenderEstimateBytes: metrics.initialRenderEstimate.bytes,
      offlineShellEstimateBytes: metrics.offlineShellEstimate.bytes,
      coldFirstSessionTransferBytes: metrics.coldFirstSessionTransfer.bytes,
      warmRepeatVisitTransferBytes: metrics.warmRepeatVisitTransfer.bytes,
    },
    displayKib: metrics.display,
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
  return {
    renderBlockingUrls,
    deferredScriptUrls,
    metadataUrls,
    pageLinkedUrls: unique([...renderBlockingUrls, ...deferredScriptUrls, ...metadataUrls]),
  }
}

function maxDisplay(current, next) {
  return {
    initialRender: maxDecimalText(current.initialRender, next.initialRender),
    offlineShell: maxDecimalText(current.offlineShell, next.offlineShell),
    coldSession: maxDecimalText(current.coldSession, next.coldSession),
    warmSession: maxDecimalText(current.warmSession, next.warmSession),
  }
}

function maxDecimalText(a, b) {
  return Number(a) >= Number(b) ? a : b
}

function coversMeasuredBytes(display, metrics) {
  return Number(display.initialRender) >= kib(metrics.initialRenderEstimate.bytes)
    && Number(display.offlineShell) >= kib(metrics.offlineShellEstimate.bytes)
    && Number(display.coldSession) >= kib(metrics.coldFirstSessionTransfer.bytes)
    && Number(display.warmSession) >= kib(metrics.warmRepeatVisitTransfer.bytes)
}

function readShell(sw) {
  const match = sw.match(/var SHELL = (\[[^\n;]+\])/)
  if (!match) throw new Error('Could not read offline shell list from dist/sw.js')
  return JSON.parse(match[1])
}

function readMatches(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1])
}

function readUrl(url, currentFiles) {
  if (url === '/') return Buffer.from(currentFiles.indexHtml)
  if (url === '/sw.js') return Buffer.from(currentFiles.swJs)
  return readFileSync(fileForUrl(url))
}

function fileForUrl(url) {
  return `${DIST}${url === '/' ? '/index.html' : url}`
}

function ensureUrlExists(url) {
  if (url === '/' || url === '/sw.js') return
  if (!existsSync(fileForUrl(url))) throw new Error(`Missing expected asset in dist: ${url}`)
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

function etag(body) {
  return `"${createHash('sha256').update(body).digest('hex')}"`
}

function serve(req, res, currentFiles) {
  const url = new URL(req.url, 'http://127.0.0.1')
  const body = readUrl(url.pathname, currentFiles)
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

function assertPlaceholders(text, placeholders) {
  for (const placeholder of placeholders) {
    if (!text.includes(placeholder)) throw new Error(`Expected ${INDEX} to include ${placeholder}`)
  }
}

function assertNoPlaceholders(text) {
  const leftovers = Object.values(PLACEHOLDERS).filter((placeholder) => text.includes(placeholder))
  if (leftovers.length) throw new Error(`Unreplaced homepage measurement placeholders: ${leftovers.join(', ')}`)
}

function sum(items) {
  return items.reduce((total, item) => total + item, 0)
}
