import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const report = JSON.parse(readFileSync('dist/asset-metrics.json', 'utf8'))
const budgets = JSON.parse(readFileSync('ci/budgets.json', 'utf8'))
const checks = [
  ['summary.initialRenderBrotliKiB', report.summary.initialRenderBrotliKiB, budgets.thresholds.initialRenderBrotliKiB],
  ['summary.firstSessionBrotliKiB', report.summary.firstSessionBrotliKiB, budgets.thresholds.firstSessionBrotliKiB],
  ['summary.offlineShellBrotliKiB', report.summary.offlineShellBrotliKiB, budgets.thresholds.offlineShellBrotliKiB],
  ['files.styles.brotliKiB', report.files[report.aliases['/styles.css']].brotliKiB, budgets.thresholds.stylesBrotliKiB],
  ['files.siteUi.brotliKiB', report.files[report.aliases['/site-ui.js']].brotliKiB, budgets.thresholds.siteUiBrotliKiB],
  ['files.sw.brotliKiB', report.files['/sw.js'].brotliKiB, budgets.thresholds.serviceWorkerBrotliKiB],
].map(([name, actual, limit]) => ({ name, actual, limit, pass: actual <= limit }))

mkdirSync('artifacts', { recursive: true })
const audit = {
  checkedAt: new Date().toISOString(),
  runtime: { node: process.version },
  budgets,
  checks,
  pass: checks.every((check) => check.pass),
  manualChecksStillNeeded: [
    'Cross-browser assistive-technology testing and real keyboard/screen-reader validation still require issue #13 manual coverage.',
    'wsg-check remains a targeted scanner for homepage categories and is not treated as blanket WSG conformance.',
  ],
}
writeFileSync('artifacts/ci-audit.json', `${JSON.stringify(audit, null, 2)}\n`)

const failed = checks.filter((check) => !check.pass)
for (const check of checks) console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}: ${check.actual.toFixed(1)} KiB <= ${check.limit.toFixed(1)} KiB`)
if (failed.length) {
  console.error(`Budget checks failed: ${failed.map((check) => check.name).join(', ')}`)
  process.exit(1)
}
