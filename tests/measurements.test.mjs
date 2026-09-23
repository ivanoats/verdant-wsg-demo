import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'

const report = JSON.parse(readFileSync('dist/measurements.json', 'utf8'))
const schema = JSON.parse(readFileSync('dist/measurements.schema.json', 'utf8'))
const offlineCache = JSON.parse(readFileSync('dist/offline-cache.json', 'utf8'))

const includesSuffix = (urls, suffix) => urls.some((url) => url.endsWith(suffix))
const ajv = new Ajv2020({ strict: false })
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/)
ajv.addFormat('date-time', /^\d{4}-\d{2}-\d{2}T.+Z?$/)
const validate = ajv.compile(schema)

test('measurements report matches the published schema contract', () => {
  const ok = validate(report)
  assert.equal(ok, true, validate.errors?.map((error) => `${error.instancePath || '$'} ${error.message}`).join('; '))
})

test('measurements report captures finalized page-linked assets for CI budgets', () => {
  const { initialRenderUrls, pageLinkedUrls, offlineShellUrls } = report.resourceSets
  assert.ok(includesSuffix(initialRenderUrls, '.css'))
  assert.ok(includesSuffix(initialRenderUrls, '.js'))
  assert.ok(pageLinkedUrls.includes('/manifest.json'))
  assert.ok(pageLinkedUrls.includes('/favicon.svg'))
  assert.equal(offlineCache.routeAliases['/components.html'], '/components')
  assert.ok(offlineShellUrls.includes(offlineCache.routeAliases['/components.html']))
  assert.ok(!offlineShellUrls.includes('/components.html'))
  assert.ok(offlineShellUrls.includes('/offline.html'))
})

test('pretty routes are measured Brotli-compressed, as the host serves them', () => {
  const request = report.metrics.localObservedTransfers.coldFirstSession.requests.find((entry) => entry.url === '/components')
  assert.ok(request, 'cold session should precache /components')
  assert.ok(request.transferBytes < statSync('dist/components.html').size / 2, 'the /components transfer should be compressed')
})
