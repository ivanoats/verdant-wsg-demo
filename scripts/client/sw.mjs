// The offline shell worker, written as a template: scripts/fingerprint.mjs
// fills in __VERSION__ and __SHELL__ after the assets are hashed.
import { COMPONENTS_FILE, COMPONENTS_ROUTE } from '../config.mjs'

// The service worker is written as a template: scripts/fingerprint.mjs fills
// in __VERSION__ (a hash of every shipped file, so each deploy changes sw.js
// and the browser installs the new worker) and __SHELL__ (the hashed URLs).
export const swJs = `// Verdant — offline shell.
// Pages: network first, so HTML is always the deployed version when online;
// the cached copy is only a fallback. Assets: hashed filenames, so a cached
// copy can never be stale — cache first is safe.
var CACHE_PREFIX = 'verdant-';
var CACHE = CACHE_PREFIX + '__VERSION__';
var LEGACY_CACHE = /^verdant-v\\d+$/;
var SHELL = __SHELL__;
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
function normalizePage(pathname) {
  if (pathname === '/' || pathname === '/index.html') return '/';
  pathname = pathname.replace(/\\/+$/, '');
  if (pathname === '${COMPONENTS_ROUTE}' || pathname === '${COMPONENTS_FILE}') return '${COMPONENTS_ROUTE}';
  if (pathname === '/404' || pathname === '/404.html') return '/404.html';
  if (pathname === '/offline' || pathname === '/offline.html') return '/offline.html';
  return null;
}
self.addEventListener('install', function (event) {
  // cache: 'reload' skips the HTTP cache, so the new shell is never
  // assembled from an older deploy's files.
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return caches.keys(); }).then(function (keys) {
    // The first cache-first worker (caches verdant-v1/v2) serves stale pages
    // that have no update prompt, so nothing would ever send SKIP_WAITING.
    // Replace it straight away; every newer worker waits for the prompt.
    if (keys.some(function (k) { return LEGACY_CACHE.test(k); })) return self.skipWaiting();
  }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    var old = keys.filter(function (k) { return k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE; });
    return Promise.all(old.map(function (k) { return caches.delete(k); }))
      .then(function () { return self.clients.claim(); });
  }));
});
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    var page = normalizePage(new URL(req.url).pathname);
    event.respondWith(fetch(req).then(function (res) {
      if (res.ok && page) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(page, copy); }); }
      return res;
    }).catch(function () {
      return caches.open(CACHE).then(function (cache) {
        if (page) {
          return cache.match(page).then(function (hit) {
            return hit || cache.match('/offline.html');
          });
        }
        return cache.match('/offline.html');
      });
    }));
    return;
  }
  event.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req); }));
});
`

