import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// axe-core scans every page for WCAG 2.x A and AA violations, in each color
// mode the site supports. Motion is reduced so no element is mid-fade when
// contrast is measured.
const PAGES = ['/', '/components', '/missing-route', '/offline.html']
const MODES = [
  { name: 'light', colorScheme: 'light' },
  { name: 'dark', colorScheme: 'dark' },
  { name: 'high contrast', colorScheme: 'light', contrast: 'more' },
  { name: 'high contrast dark', colorScheme: 'dark', contrast: 'more' },
]
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const describe = (violation) =>
  `${violation.id} (${violation.impact}): ${violation.help} at ${violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join(', ')}`

for (const mode of MODES) {
  for (const path of PAGES) {
    test(`${path} has no WCAG A/AA violations in ${mode.name}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: mode.colorScheme, contrast: mode.contrast ?? 'no-preference', reducedMotion: 'reduce' })
      await page.goto(path)
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      expect(results.violations.map(describe)).toEqual([])
    })
  }
}
