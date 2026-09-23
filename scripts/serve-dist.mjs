// Serves the built dist/ folder for the Playwright checks, with the same
// pretty routes Netlify uses (/components -> components.html).
//
// Only files that exist in dist/ when the server starts can be served: the
// request path is looked up in that table and never joined onto a
// filesystem path, so a crafted URL cannot reach anything outside dist/.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'

const PORT = Number.parseInt(process.env.PORT ?? '', 10) || 4173
const DIST_ROOT = resolve('dist')
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

// URL path -> absolute file, for every file in dist/ plus its pretty aliases.
const routes = new Map()
const addFile = (file) => {
  const url = `/${relative(DIST_ROOT, file).split(sep).join('/')}`
  routes.set(url, file)
  if (url.endsWith('/index.html')) routes.set(url.slice(0, -'index.html'.length), file)
  else if (url.endsWith('.html')) routes.set(url.slice(0, -'.html'.length), file)
}
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (entry.isFile()) addFile(path)
  }
}
walk(DIST_ROOT)
const NOT_FOUND = routes.get('/404.html')

// Decoded request path, or null when the percent-encoding is malformed.
const decodePath = (pathname) => {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return null
  }
}

const reply = (res, status, type, body) => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
  res.end(body)
}

createServer(async (req, res) => {
  const pathname = decodePath(new URL(req.url, 'http://localhost').pathname)
  if (pathname === null) return reply(res, 400, TYPES['.txt'], 'Bad request')
  const file = routes.get(pathname)
  if (file) return reply(res, 200, TYPES[extname(file)] ?? 'application/octet-stream', await readFile(file))
  if (NOT_FOUND) return reply(res, 404, TYPES['.html'], await readFile(NOT_FOUND))
  return reply(res, 404, TYPES['.txt'], 'Not found')
}).listen(PORT, () => {
  console.log(`Serving ${routes.size} routes from dist on http://127.0.0.1:${PORT}`)
})
