// HTML helpers and the recursive public/ copy, shared across the page modules.
import { writeFileSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// A hand-rolled recursive copy: some mounted/virtual filesystems choke on
// Node's native cpSync fast paths (fcopyfile/clonefile), so this sticks to
// plain read/write, which works everywhere.
export function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) copyDir(srcPath, destPath)
    else writeFileSync(destPath, readFileSync(srcPath))
  }
}

export const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Light, safe HTML minification: collapse inter-tag whitespace only — never
// touches text content (and <pre> blocks are left alone), so copy stays intact.
export const minifyHtml = (html) => {
  const pres = []
  const held = html.replace(/<pre[\s\S]*?<\/pre>/gu, (m) => `<!--pre:${pres.push(m) - 1}-->`)
  const collapsed = held.replace(/>\s+</gu, '><').replace(/<!--pre:(\d+)-->/gu, (_, i) => pres[Number(i)])
  return `${collapsed.trim()}\n`
}

