// Compares the finalized build report (dist/measurements.json, written by
// scripts/stats.mjs) against the reviewed limits in ci/budgets.json, and
// writes artifacts/ci-audit.json for the CI run.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const FONT_EXTENSIONS = new Set(['.woff2', '.woff', '.ttf', '.otf', '.eot'])

// Total size of every font file in dist/, in KiB. System fonts cost nothing.
const webFontKiB = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
  const path = join(dir, entry.name)
  if (entry.isDirectory()) return total + webFontKiB(path)
  return FONT_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? total + statSync(path).size / 1024 : total
}, 0)

const report = JSON.parse(readFileSync('dist/measurements.json', 'utf8'))
const budgets = JSON.parse(readFileSync('ci/budgets.json', 'utf8'))
const measured = {
  initialRenderEstimateKiB: report.displayKib.initialRender,
  offlineShellEstimateKiB: report.displayKib.offlineShell,
  coldFirstSessionTransferKiB: report.displayKib.coldSession,
  warmRepeatVisitTransferKiB: report.displayKib.warmSession,
  webFontsKiB: webFontKiB('dist'),
}
const checks = Object.entries(budgets.thresholds).map(([name, limit]) => {
  const actual = Number(measured[name])
  return { name: `budgets.${name}`, actual, limit, pass: Number.isFinite(actual) && actual <= limit }
})

mkdirSync('artifacts', { recursive: true })
const audit = {
  checkedAt: new Date().toISOString(),
  runtime: { node: process.version },
  report: budgets.report,
  schema: budgets.schema,
  budgets,
  checks,
  pass: checks.every((check) => check.pass),
  manualChecksStillNeeded: budgets.manualChecksStillNeeded,
}
writeFileSync('artifacts/ci-audit.json', `${JSON.stringify(audit, null, 2)}\n`)

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}: ${check.actual.toFixed(1)} KiB <= ${check.limit.toFixed(1)} KiB`)
}
const failed = checks.filter((check) => !check.pass)
if (failed.length) throw new Error(`Budget checks failed: ${failed.map((check) => check.name).join(', ')}`)
