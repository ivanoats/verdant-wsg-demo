import test, { before } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distFile = (name) => readFileSync(resolve(repoRoot, 'dist', name), 'utf8')
const distJson = (name) => JSON.parse(distFile(name))

before(() => {
  execFileSync('npm', ['run', 'build'], { cwd: repoRoot, stdio: 'pipe' })
})

test('production service worker normalizes pretty routes and falls back to offline content', () => {
  const sw = distFile('sw.js')
  assert.match(sw, /pathname === '\/components' \|\| pathname === '\/components\.html'/)
  assert.match(sw, /cache\.match\('\/offline\.html'\)/)
  assert.match(sw, /var SHELL = \["\/","\/components","\/404\.html","\/offline\.html"/)
})

test('production service worker keeps cache ownership scoped and removes forced tab reloads', () => {
  const sw = distFile('sw.js')
  assert.match(sw, /k\.indexOf\(CACHE_PREFIX\) === 0 && k !== CACHE/)
  assert.match(sw, /event\.data && event\.data\.type === 'SKIP_WAITING'/)
  assert.doesNotMatch(sw, /tab\.navigate\(tab\.url\)/)
  // Only the legacy cache-first worker is replaced without the prompt.
  assert.match(sw, /var LEGACY_CACHE = \/\^verdant-v\\d\+\$\//)
  assert.match(sw, /LEGACY_CACHE\.test\(k\); \}\)\) return self\.skipWaiting\(\)/)
})

test('generated pages include update controls and the offline fallback page', () => {
  const index = distFile('index.html')
  const components = distFile('components.html')
  const register = distFile(`assets/${/\/assets\/(sw-register\.[^"]+\.js)/.exec(index)[1]}`)
  const offline = distFile('offline.html')
  const manifest = distJson('offline-cache.json')
  assert.deepEqual(manifest.publicRoutes, ['/', '/components'])
  assert.deepEqual(manifest.canonicalCacheKeys, ['/', '/components', '/404.html', '/offline.html'])
  assert.equal(manifest.routeAliases['/components.html'], '/components')
  assert.match(index, /href="\/components"/)
  assert.match(components, /<link rel="canonical" href="https:\/\/verdant-wsg-demo\.netlify\.app\/components">/)
  assert.match(index, /id="sw-update"/)
  assert.match(index, /aria-live="polite"/)
  assert.match(index, /Update now/)
  assert.match(register, /if \(!shouldRefresh \|\| refreshing\) return;/)
  assert.match(offline, /Offline for now/)
})
