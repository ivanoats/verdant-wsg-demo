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

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^((\.\.[/\\])+)/, '')
  if (path.endsWith('/')) path += 'index.html'
  let file = join(DIST, path)
  try {
    await stat(file)
  } catch {
    if (!extname(file)) {
      try { file = `${file}.html`; await stat(file) }
      catch { file = join(DIST, '404.html') }
    } else file = join(DIST, '404.html')
  }
  const ext = extname(file)
  res.writeHead(file.endsWith('404.html') ? 404 : 200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(await readFile(file))
}).listen(PORT, () => {
  console.log(`Serving dist on http://127.0.0.1:${PORT}`)
})
