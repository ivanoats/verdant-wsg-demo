import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const report = JSON.parse(readFileSync('dist/measurements.json', 'utf8'))
const budgets = JSON.parse(readFileSync('ci/budgets.json', 'utf8'))
const checks = [
  ['budgets.initialRenderEstimateKiB', Number(report.displayKib.initialRender), budgets.thresholds.initialRenderEstimateKiB],
  ['budgets.offlineShellEstimateKiB', Number(report.displayKib.offlineShell), budgets.thresholds.offlineShellEstimateKiB],
  ['budgets.coldFirstSessionTransferKiB', Number(report.displayKib.coldSession), budgets.thresholds.coldFirstSessionTransferKiB],
  ['budgets.warmRepeatVisitTransferKiB', Number(report.displayKib.warmSession), budgets.thresholds.warmRepeatVisitTransferKiB],
].map(([name, actual, limit]) => ({ name, actual, limit, pass: actual <= limit }))

mkdirSync('artifacts', { recursive: true })
const audit = {
  checkedAt: new Date().toISOString(),
  runtime: { node: process.version },
  report: 'dist/measurements.json',
  schema: 'dist/measurements.schema.json',
  budgets,
  checks,
  pass: checks.every((check) => check.pass),
  manualChecksStillNeeded: [
    'Assistive-technology coverage, additional browser/device combinations, and human usability validation remain tracked in issue #13.',
    'The service-worker update prompt contract from #21 is still blocked until that UI lands; this CI run only covers the current claim-only activation behavior.',
    'wsg-check remains a targeted homepage scanner and is not treated as blanket WSG conformance.',
  ],
}
writeFileSync('artifacts/ci-audit.json', `${JSON.stringify(audit, null, 2)}\n`)

const failed = checks.filter((check) => !check.pass)
for (const check of checks) console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}: ${check.actual.toFixed(1)} KiB <= ${check.limit.toFixed(1)} KiB`)
if (failed.length) {
  console.error(`Budget checks failed: ${failed.map((check) => check.name).join(', ')}`)
  process.exit(1)
}
