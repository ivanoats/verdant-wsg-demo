import { test, expect } from '@playwright/test'

const contrast = ({ foreground, background }) => {
  const parse = (rgb) => rgb.match(/\d+(?:\.\d+)?/g).slice(0, 3).map((value) => Number(value) / 255)
  const channel = (value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  const luminance = (rgb) => {
    const [r, g, b] = parse(rgb).map(channel)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [light, dark] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

test('a11y affordances stay visible at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/components')

  const field = page.getByLabel('Website URL')
  const describedBy = await field.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  for (const id of describedBy.split(/\s+/)) await expect(page.locator(`#${id}`)).toContainText(/scan|required|field/i)

  const placeholder = await field.evaluate((input) => {
    const placeholderStyle = window.getComputedStyle(input, '::placeholder')
    const style = window.getComputedStyle(input)
    return {
      foreground: placeholderStyle.color,
      background: style.backgroundColor,
    }
  })
  expect(contrast(placeholder)).toBeGreaterThanOrEqual(4.5)

  await page.goto('/')
  const proseLink = page.locator('main').getByRole('link', { name: 'WSG', exact: true })
  await expect(proseLink).toBeVisible()
  expect(await proseLink.evaluate((link) => window.getComputedStyle(link).textDecorationLine)).toContain('underline')

  await page.goto('/missing-route')
  const recoveryLink = page.getByRole('link', { name: /back to the overview/i })
  await expect(recoveryLink).toBeVisible()
  expect(await recoveryLink.evaluate((link) => window.getComputedStyle(link).textDecorationLine)).toContain('underline')

  await page.goto('/')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: /skip to content/i })
  await expect(skipLink).toBeFocused()
  expect(await skipLink.evaluate((link) => window.getComputedStyle(link).top)).not.toBe('-48px')

  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1)
})

test('theme preference persists and system mode tracks OS changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/components')

  const control = page.getByLabel('Theme')
  await control.selectOption('dark')
  await expect(control).toHaveValue('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme-resolved'))).toBe('dark')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('verdant-theme-preference'))).toBe('dark')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme-resolved'))).toBe('dark')

  await page.goto('/')
  await expect(page.getByLabel('Theme')).toHaveValue('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme-override'))).toBe('dark')

  await page.getByLabel('Theme').selectOption('system')
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme-resolved'))).toBe('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme-resolved'))).toBe('dark')
})

test('motion preview is bounded and reduced-motion safe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/components')

  const button = page.locator('[data-motion-preview]')
  const status = page.getByText(/animations stay still until you preview them\.|static by default\./i)
  await expect(button).toBeEnabled()
  await expect(status).toBeVisible()

  await button.click()
  await expect.poll(async () => button.isDisabled()).toBe(true)
  await expect(page.getByText(/animating for a short preview|preview runs once/i)).toBeVisible()
  await page.waitForTimeout(3400)
  await expect.poll(async () => button.isDisabled()).toBe(false)
  await expect(page.getByText(/animations stay still until you preview them\.|preview runs once, then stops automatically\./i)).toBeVisible()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components')
  await expect(page.locator('[data-motion-preview]')).toBeDisabled()
  await expect(page.getByText(/reduced motion is on, so the loading demos stay static\./i)).toBeVisible()
})
