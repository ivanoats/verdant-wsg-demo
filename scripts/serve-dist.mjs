// Serves the built dist/ folder for the Playwright checks, with the same
// pretty routes Netlify uses (/components -> components.html). Every
// resolved path is confined to dist/, and malformed URLs get a 400.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

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

const inDist = (file) => file === DIST_ROOT || file.startsWith(`${DIST_ROOT}${sep}`)

// Returns an absolute path inside dist/, or null for a malformed or escaping URL.
const confine = (pathname) => {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null
  const relative = decoded.endsWith('/') ? `${decoded}index.html` : decoded
  const file = resolve(DIST_ROOT, `.${relative}`)
  return inDist(file) ? file : null
}

const isFile = async (file) => {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

// First existing candidate: the file itself, a directory index, or a pretty route.
const findFile = async (file) => {
  const candidates = [file, resolve(file, 'index.html')]
  if (!extname(file)) candidates.push(`${file}.html`)
  for (const candidate of candidates) {
    if (inDist(candidate) && await isFile(candidate)) return candidate
  }
  return null
}

const reply = (res, status, type, body) => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
  res.end(body)
}

createServer(async (req, res) => {
  const file = confine(new URL(req.url, 'http://localhost').pathname)
  if (!file) return reply(res, 400, TYPES['.txt'], 'Bad request')
  const found = await findFile(file)
  if (found) return reply(res, 200, TYPES[extname(found)] ?? 'application/octet-stream', await readFile(found))
  return reply(res, 404, TYPES['.html'], await readFile(resolve(DIST_ROOT, '404.html')))
}).listen(PORT, () => {
  console.log(`Serving dist on http://127.0.0.1:${PORT}`)
})
