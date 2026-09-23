import { test, expect } from '@playwright/test'

// Screenshot of every gallery specimen in light, dark and high contrast.
// Baselines live in tests/__screenshots__ and are generated on the CI runner
// (see .github/workflows/update-screenshots.yml), because font rendering
// differs between machines. Locally these tests are skipped unless VISUAL=1.
const SPECIMENS = ['link', 'button', 'field', 'switch', 'status', 'loading', 'layout']
const MODES = [
  { name: 'light', colorScheme: 'light', contrast: 'no-preference' },
  { name: 'dark', colorScheme: 'dark', contrast: 'no-preference' },
  { name: 'contrast', colorScheme: 'light', contrast: 'more' },
]

test.skip(!process.env.CI && !process.env.VISUAL, 'Screenshot baselines come from the CI runner; set VISUAL=1 to compare locally.')

for (const mode of MODES) {
  test(`gallery specimens look unchanged in ${mode.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.emulateMedia({ colorScheme: mode.colorScheme, contrast: mode.contrast, reducedMotion: 'reduce' })
    await page.goto('/components')
    for (const id of SPECIMENS) {
      const specimen = page.locator(`section[aria-labelledby="${id}-specimen-title"]`)
      await expect.soft(specimen, `${id} specimen in ${mode.name}`).toHaveScreenshot(`${id}-${mode.name}.png`, { animations: 'disabled', caret: 'hide' })
    }
  })
}
