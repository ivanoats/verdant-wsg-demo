// Local dev server: build once, serve dist/, rebuild on change, reload the
// browser. No dependencies beyond Node itself.
//
//   npm run dev            -> http://localhost:4321
//   PORT=3000 npm run dev  -> another port
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { watch } from 'node:fs'
import { spawn } from 'node:child_process'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT) || 4321
const DIST = 'dist'
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
}

// In dev the offline service worker would serve stale cached pages, so
// /sw.js is replaced by one that clears its caches and unregisters itself.
const DEV_SW = `self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
    .then(function () { return self.registration.unregister(); }));
});`

const RELOAD_JS = `new EventSource('/__reload').addEventListener('reload', function () { location.reload(); });`
const RELOAD_TAG = '<script src="/__reload.js"></script>'

// ---- build ----------------------------------------------------------------

const run = (cmd) => new Promise((resolve) => {
  const child = spawn(cmd, { shell: true, stdio: 'inherit' })
  child.on('exit', (code) => resolve(code === 0))
})

let building = false
let queued = false
let needCodegen = false
async function build() {
  if (building) { queued = true; return }
  building = true
  const started = Date.now()
  // Same steps as `npm run build`, minus the codegen that npm's prebuild hook
  // would re-run every time; codegen only runs when panda.config.ts changes.
  // (`npm run dev` puts node_modules/.bin on PATH, so `panda` resolves.)
  const ok = (!needCodegen || await run('panda codegen --silent')) &&
    await run('node scripts/build.mjs && panda cssgen -m --lightningcss --silent -o dist/styles.css && node scripts/stats.mjs && node scripts/fingerprint.mjs')
  needCodegen = false
  building = false
  if (ok) {
    console.log(`✓ built in ${Date.now() - started}ms`)
    for (const res of clients) res.write('event: reload\ndata: \n\n')
  } else {
    console.log('✗ build failed — fix the error above and save again')
  }
  if (queued) { queued = false; build() }
}

// ---- watch ------------------------------------------------------------------

let timer
const onChange = (file) => {
  // Panda's config reads its tokens from scripts/theme.mjs, so either one
  // changing means the generated styled-system has to be rebuilt.
  if (file && /panda\.config|theme\.mjs/.test(String(file))) needCodegen = true
  clearTimeout(timer)
  timer = setTimeout(build, 80)
}
watch('scripts', { recursive: true }, (_, f) => onChange(f))
watch('public', { recursive: true }, (_, f) => onChange(f))
watch('panda.config.ts', () => onChange('panda.config.ts'))

// ---- serve ------------------------------------------------------------------

const clients = new Set()

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
    res.write(': connected\n\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }
  if (url.pathname === '/__reload.js') return send(res, 200, '.js', RELOAD_JS)
  if (url.pathname === '/sw.js') return send(res, 200, '.js', DEV_SW)

  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  if (path.endsWith('/')) path += 'index.html'
  let file = join(DIST, path)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    send(res, 200, extname(file), await readFile(file))
  } catch {
    try {
      if (!extname(file)) send(res, 200, '.html', await readFile(`${file}.html`))
      else throw new Error('not found')
    } catch {
      try { send(res, 404, '.html', await readFile(join(DIST, '404.html'))) }
      catch { send(res, 404, '.txt', 'Not found') }
    }
  }
}).listen(PORT, () => {
  console.log(`Verdant dev server → http://localhost:${PORT}  (watching scripts/, public/, panda.config.ts)`)
})

function send(res, status, ext, body) {
  if (ext === '.html') body = String(body).replace('</body>', `${RELOAD_TAG}</body>`)
  res.writeHead(status, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(body)
}

build()
