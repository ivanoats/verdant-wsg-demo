import { readFileSync } from 'node:fs'
import { brotliCompressSync, gzipSync, constants } from 'node:zlib'

const htmlPath = 'dist/index.html'
const html = readFileSync(htmlPath, 'utf8')

const firstMatch = (pattern) => html.match(pattern)?.[0] ?? ''
const allMatches = (pattern) => html.match(pattern) ?? []
const count = (source, pattern) => (source.match(pattern) ?? []).length
const size = (source) => ({
  rawBytes: Buffer.byteLength(source),
  gzipBytes: gzipSync(Buffer.from(source), { level: 9 }).length,
  brotliBytes: brotliCompressSync(Buffer.from(source), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
})
const svgTagPattern = /<(?!!|\/)(svg|g|path|rect|circle|ellipse|defs|clipPath|use|line|polyline|polygon)\b[^>]*?>/g

const hero = firstMatch(/<svg viewBox="0 0 560 440"[\s\S]*?<\/svg>/)
const meadow = firstMatch(/<svg viewBox="0 0 600 120"[\s\S]*?<\/svg>/)
const svgBlocks = allMatches(/<svg\b[\s\S]*?<\/svg>/g)
const svgMarkup = svgBlocks.join('')

const report = {
  generatedFrom: htmlPath,
  page: {
    ...size(html),
    domElements: count(html, /<(?!!|\/)[A-Za-z][^>]*?>/g),
    svgElements: count(html, svgTagPattern),
  },
  svgMarkup: {
    ...size(svgMarkup),
    shareOfPageRawBytes: Number(((Buffer.byteLength(svgMarkup) / Buffer.byteLength(html)) * 100).toFixed(1)),
    blockCount: svgBlocks.length,
  },
  hero: {
    ...size(hero),
    svgElements: count(hero, svgTagPattern),
  },
  meadow: {
    ...size(meadow),
    svgElements: count(meadow, svgTagPattern),
  },
}

console.log(JSON.stringify(report, null, 2))

if (process.argv[2]) {
  const url = process.argv[2]
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.error('\nPlaywright is required for the optional CPU-throttled profile.')
    console.error('Install it temporarily with: npm install --no-save --package-lock=false playwright')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const client = await page.context().newCDPSession(page)

  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    window.__artMetrics = { longTasks: [], rafDeltas: [] }
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__artMetrics.longTasks.push(entry.duration)
        }
      })
      observer.observe({ type: 'longtask', buffered: true })
    } catch {}

    let last = 0
    let start = 0
    const sampleForMs = 2500
    const tick = (ts) => {
      if (!start) start = ts
      if (last) window.__artMetrics.rafDeltas.push(ts - last)
      last = ts
      if (ts - start < sampleForMs) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  await page.goto(url, { waitUntil: 'load' })
  await page.waitForTimeout(2600)

  const runtime = await page.evaluate(() => {
    const deltas = window.__artMetrics.rafDeltas.slice().sort((a, b) => a - b)
    const percentile = (values, fraction) => values.length ? values[Math.floor(values.length * fraction)] : 0
    const longTasks = window.__artMetrics.longTasks
    return {
      domElements: document.querySelectorAll('*').length,
      svgElements: document.querySelectorAll('svg, svg *').length,
      heroSvgElements: (document.querySelector('svg[viewBox="0 0 560 440"]')?.querySelectorAll('*').length ?? 0) + 1,
      rafSamples: deltas.length,
      rafP95Ms: Number(percentile(deltas, 0.95).toFixed(2)),
      rafMaxMs: Number((deltas[deltas.length - 1] ?? 0).toFixed(2)),
      longTaskCount: longTasks.length,
      maxLongTaskMs: Number(Math.max(0, ...longTasks).toFixed(2)),
    }
  })

  console.log(JSON.stringify({
    cpuThrottle: '4x',
    viewport: '1280x900',
    runtime,
  }, null, 2))

  await browser.close()
}
