// Prose pages are authored as Markdown in content/ and rendered here into the
// same Panda-classed markup the rest of the site emits. Only the renderer holds
// css() bindings, so `panda cssgen` still statically extracts every class the
// article uses (the Markdown itself carries no styling).
import { Marked } from 'marked'

// A deliberately small frontmatter subset: `key: value` pairs, plus one level of
// `- key: value` list items. Enough for a page's title/description/CTA metadata,
// and small enough to read at a glance. Anything more belongs in a real config.
export const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { data: {}, body: source }
  const data = {}
  let list = null
  let item = null
  for (const raw of match[1].split('\n')) {
    if (!raw.trim()) continue
    const listStart = raw.match(/^(\s+)-\s+(\w+):\s*(.*)$/)
    if (listStart) {
      item = { [listStart[2]]: listStart[3] }
      list?.push(item)
      continue
    }
    const nested = raw.match(/^\s+(\w+):\s*(.*)$/)
    if (nested && item) {
      item[nested[1]] = nested[2]
      continue
    }
    const pair = raw.match(/^(\w+):\s*(.*)$/)
    if (!pair) continue
    if (pair[2] === '') {
      list = []
      item = null
      data[pair[1]] = list
    } else {
      list = null
      item = null
      data[pair[1]] = pair[2]
    }
  }
  return { data, body: source.slice(match[0].length) }
}

// `{{NAME}}` resolves against shared constants, so links that already live in
// config.mjs (the repo URL, the WSG spec) are not duplicated in prose.
export const expandVars = (text, vars) =>
  text.replace(/\{\{(\w+)\}\}/g, (whole, name) => (name in vars ? vars[name] : whole))

// `classes` maps each block to the Panda class string the page already uses, so
// the Markdown path emits byte-identical markup to hand-written templates.
/**
 * @param {string} body
 * @param {{ classes?: Record<string, string>, vars?: Record<string, string> }} [options]
 */
export const renderMarkdown = (body, { classes = {}, vars = {} } = {}) => {
  const md = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        return `<h${depth} class="${classes[`h${depth}`] ?? ''}">${this.parser.parseInline(tokens)}</h${depth}>`
      },
      paragraph({ tokens }) {
        return `<p class="${classes.paragraph ?? ''}">${this.parser.parseInline(tokens)}</p>`
      },
      // A blockquote marks the article's lead statement — the one line set in
      // accent type. It renders as a paragraph, not a <blockquote>, because it
      // is the author speaking, not a quotation.
      blockquote({ tokens }) {
        const inner = tokens.flatMap((t) => t.tokens ?? [])
        return `<p class="${classes.lead ?? ''}">${this.parser.parseInline(inner)}</p>`
      },
      link({ href, tokens }) {
        return `<a class="${classes.link ?? ''}" href="${href}">${this.parser.parseInline(tokens)}</a>`
      },
    },
  })
  return md.parse(expandVars(body, vars)).trim()
}
