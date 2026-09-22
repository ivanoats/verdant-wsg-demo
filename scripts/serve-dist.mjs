import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT) || 4173
const DIST = 'dist'
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}

const send = (res, status, body) => {
  const ext = extname(body.path || '')
  res.writeHead(status, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(body.contents)
}

const badRequest = (res) => {
  res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
  res.end('Bad request')
}

const resolvePath = (pathname) => {
  let path
  try {
    path = normalize(`.${decodeURIComponent(pathname)}`)
  } catch {
    return null
  }
  if (path === '..' || path.startsWith('../') || path.startsWith('..\\') || path.startsWith('/') || path.startsWith('\\') || /^[A-Za-z]:/.test(path)) {
    return false
  }
  if (path === './' || path === '.') return 'index.html'
  return path.endsWith('/') ? `${path}index.html` : path
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const path = resolvePath(url.pathname)
  if (path === null || path === false) return badRequest(res)
  let file = join(DIST, path)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    if (!extname(file)) {
      try { file = `${file}.html`; await stat(file) }
      catch { file = join(DIST, '404.html') }
    } else file = join(DIST, '404.html')
  }
  send(res, file.endsWith('404.html') ? 404 : 200, { path: file, contents: await readFile(file) })
}).listen(PORT, () => {
  console.log(`Serving dist on http://127.0.0.1:${PORT}`)
})
