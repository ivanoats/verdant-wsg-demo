import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { highContrastTokens, themeTokens, themeVarName } from '../packages/verdant-design/src/theme.mjs'

let stylesheet

test.beforeAll(() => {
  const directory = mkdtempSync(join(tmpdir(), 'verdant-contrast-'))
  const preset = fileURLToPath(new URL('../packages/verdant-design/src/preset.mjs', import.meta.url))
  const cli = fileURLToPath(new URL('../node_modules/@pandacss/dev/bin.js', import.meta.url))
  const config = join(directory, 'panda.config.mjs')
  const output = join(directory, 'styles.css')
  try {
    writeFileSync(config, `
      import { verdantPreset } from ${JSON.stringify(preset)}
      export default {
        presets: [verdantPreset],
        conditions: { dark: '&:is(.dark, .dark *)' },
        include: [],
        outdir: ${JSON.stringify(join(directory, 'styled-system'))},
      }
    `)
    execFileSync(process.execPath, [cli, 'cssgen', '--config', config, '--outfile', output], { stdio: 'pipe' })
    stylesheet = readFileSync(output, 'utf8')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

for (const colorScheme of ['light', 'dark']) {
  for (const selectorDark of [false, true]) {
    for (const override of [null, 'light', 'dark']) {
      test(`contrast follows selector dark=${selectorDark}, override=${override}, OS=${colorScheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, contrast: 'more' })
        await page.setContent(`<!doctype html><html${selectorDark ? ' class="dark"' : ''}${override ? ` data-theme-override="${override}"` : ''}><head><style>${stylesheet}</style></head><body></body></html>`)

        const mode = override ?? (selectorDark ? 'dark' : 'light')
        const expected = {
          ...Object.fromEntries(Object.entries(themeTokens).map(([name, values]) => [themeVarName(name), values[mode]])),
          ...Object.fromEntries(Object.entries(highContrastTokens).map(([name, values]) => [themeVarName(name), values[mode]])),
        }
        const actual = await page.evaluate((names) => {
          const style = getComputedStyle(document.documentElement)
          return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]))
        }, Object.keys(expected))
        expect(actual).toEqual(expected)
      })
    }
  }
}
