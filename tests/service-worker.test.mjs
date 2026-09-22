import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'

const swSource = readFileSync('dist/sw.js', 'utf8')
const offlineCacheContract = JSON.parse(readFileSync('dist/offline-cache.json', 'utf8'))
const currentCache = `verdant-shell-${swSource.match(/var CACHE = PREFIX \+ '([^']+)'/)[1]}`

const loadWorker = ({ fetchImpl = async () => ({ ok: true, clone() { return this } }), stores = {} } = {}) => {
  const listeners = {}
  const cacheStores = new Map(Object.entries(stores).map(([name, entries]) => [name, new Map(Object.entries(entries))]))
  const deleted = []
  let claimed = 0
  let navigated = 0
  let skipped = 0
  const caches = {
    open: async (name) => {
      if (!cacheStores.has(name)) cacheStores.set(name, new Map())
      const store = cacheStores.get(name)
      return {
        addAll: async (requests) => {
          for (const request of requests) store.set(new URL(request.url).pathname, { ok: true, clone() { return this } })
        },
        put: async (key, value) => {
          const url = typeof key === 'string' ? key : new URL(key.url).pathname
          store.set(url, value)
        },
      }
    },
    keys: async () => [...cacheStores.keys()],
    delete: async (name) => {
      deleted.push(name)
      return cacheStores.delete(name)
    },
    match: async (key) => {
      const url = typeof key === 'string' ? key : new URL(key.url).pathname
      for (const store of cacheStores.values()) if (store.has(url)) return store.get(url)
      return undefined
    },
  }
  class Request {
    constructor(url, init = {}) {
      this.url = new URL(url, 'https://verdant.test').href
      this.method = init.method || 'GET'
      this.mode = init.mode || 'same-origin'
      this.cache = init.cache
    }
  }
  const context = vm.createContext({
    URL,
    Request,
    caches,
    fetch: fetchImpl,
    console,
    self: {
      location: { origin: 'https://verdant.test' },
      clients: {
        claim: async () => { claimed += 1 },
        matchAll: async () => [{ navigate() { navigated += 1 } }],
      },
      skipWaiting() { skipped += 1 },
      addEventListener(type, handler) { listeners[type] = handler },
    },
  })
  vm.runInContext(swSource, context)
  return { listeners, cacheStores, deleted, metrics: { get claimed() { return claimed }, get navigated() { return navigated }, get skipped() { return skipped } } }
}

const dispatch = async (handler, event) => {
  const pending = []
  const response = []
  handler({
    ...event,
    waitUntil(promise) { pending.push(promise) },
    respondWith(promise) { response.push(promise) },
  })
  await Promise.all(pending)
  return response[0] ? response[0] : undefined
}

test('install caches every published canonical key and offline fallback', async () => {
  const worker = loadWorker()
  await dispatch(worker.listeners.install, {})
  const cache = [...worker.cacheStores.values()][0]
  for (const key of offlineCacheContract.canonicalCacheKeys) assert.ok(cache.has(key), `${key} should be precached`)
  assert.ok(cache.has(offlineCacheContract.offlineFallback))
  assert.equal(worker.metrics.skipped, 1)
})

test('offline navigation honors published route aliases and fallback contract', async () => {
  const componentsResponse = { ok: true, body: 'components', clone() { return this } }
  const offlineResponse = { ok: true, body: 'offline', clone() { return this } }
  const canonicalComponents = offlineCacheContract.routeAliases['/components.html']
  const worker = loadWorker({ fetchImpl: async () => { throw new Error('offline') }, stores: { 'verdant-shell-test': { [canonicalComponents]: componentsResponse, [offlineCacheContract.offlineFallback]: offlineResponse } } })
  const componentsResult = await dispatch(worker.listeners.fetch, { request: { method: 'GET', mode: 'navigate', url: 'https://verdant.test/components' } })
  assert.equal(await componentsResult, componentsResponse)
  const aliasResult = await dispatch(worker.listeners.fetch, { request: { method: 'GET', mode: 'navigate', url: 'https://verdant.test/components.html' } })
  assert.equal(await aliasResult, componentsResponse)
  const unknownResult = await dispatch(worker.listeners.fetch, { request: { method: 'GET', mode: 'navigate', url: 'https://verdant.test/unknown' } })
  assert.equal(await unknownResult, offlineResponse)
})

test('activate only removes this app cache namespace and does not force reload tabs', async () => {
  const worker = loadWorker({ stores: { [currentCache]: {}, 'verdant-shell-stale': {}, 'another-app': {} } })
  await dispatch(worker.listeners.activate, {})
  assert.deepEqual(worker.deleted, ['verdant-shell-stale'])
  assert.equal(worker.metrics.claimed, 1)
  assert.equal(worker.metrics.navigated, 0)
})

test('successful navigations refresh the published canonical page key', async () => {
  const response = { ok: true, body: 'fresh', clone() { return this } }
  const worker = loadWorker({ fetchImpl: async () => response, stores: { 'verdant-shell-test': {} } })
  const result = await dispatch(worker.listeners.fetch, { request: { method: 'GET', mode: 'navigate', url: 'https://verdant.test/components' } })
  assert.equal(await result, response)
  await new Promise((resolve) => setImmediate(resolve))
  const canonicalComponents = offlineCacheContract.routeAliases['/components.html']
  const cached = [...worker.cacheStores.values()].find((cache) => cache.get(canonicalComponents) === response)
  assert.ok(cached)
})
