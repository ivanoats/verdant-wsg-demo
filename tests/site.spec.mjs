import { test, expect } from '@playwright/test'

const contrast = ({ foreground, background, decoration }) => {
  const parse = (rgb) => rgb.match(/\d+(?:\.\d+)?/g).slice(0, 3).map((value) => Number(value) / 255)
  const channel = (value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  const luminance = (rgb) => {
    const [r, g, b] = parse(rgb).map(channel)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (light + 0.05) / (dark + 0.05)
  }
  return { placeholder: ratio(foreground, background), distinction: ratio(foreground, decoration) }
}

test('a11y affordances stay visible at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/components')

  const field = page.locator('#site-url')
  await expect(field).toHaveAttribute('aria-describedby', 'site-url-hint')
  await expect(page.locator('#site-url-hint')).toHaveText(/enough to run a scan/i)

  const placeholder = await field.evaluate((input) => {
    const placeholderStyle = window.getComputedStyle(input, '::placeholder')
    const style = window.getComputedStyle(input)
    return {
      foreground: placeholderStyle.color,
      background: style.backgroundColor,
      bodyColor: style.color,
    }
  })
  const ratios = contrast({ foreground: placeholder.foreground, background: placeholder.background, decoration: placeholder.bodyColor })
  expect(ratios.placeholder).toBeGreaterThanOrEqual(4.5)

  await page.goto('/')
  const proseLink = page.locator('main p a').first()
  const proseDecoration = await proseLink.evaluate((link) => window.getComputedStyle(link).textDecorationLine)
  expect(proseDecoration).toContain('underline')

  await page.goto('/missing-route')
  const recoveryLink = page.getByRole('link', { name: /back to the overview/i })
  await expect(recoveryLink).toBeVisible()
  const recoveryDecoration = await recoveryLink.evaluate((link) => window.getComputedStyle(link).textDecorationLine)
  expect(recoveryDecoration).toContain('underline')

  await page.goto('/')
  await page.keyboard.press('Tab')
  const skipLink = page.locator('a[href="#main"]')
  await expect(skipLink).toBeFocused()
  const skipTop = await skipLink.evaluate((link) => window.getComputedStyle(link).top)
  expect(skipTop).not.toBe('-48px')

  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1)
})

test('theme preference persists and system mode tracks OS changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/components')

  const select = page.locator('#theme-preference')
  await select.selectOption('dark')
  await expect(select).toHaveValue('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.themeResolved)).toBe('dark')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.themeResolved)).toBe('dark')

  await page.goto('/')
  await expect(page.locator('#theme-preference')).toHaveValue('dark')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.themeResolved)).toBe('dark')

  await page.locator('#theme-preference').selectOption('system')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.themeResolved)).toBe('light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.themeResolved)).toBe('dark')
})

test('motion preview is bounded and reduced-motion safe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/components')

  const button = page.locator('#motion-preview')
  const demo = page.locator('[data-motion-demo]')
  await expect(button).toBeEnabled()
  await expect(demo).toHaveAttribute('data-running', 'false')

  await button.click()
  await expect(demo).toHaveAttribute('data-running', 'true')
  await expect(button).toBeDisabled()
  await page.waitForTimeout(3400)
  await expect(demo).toHaveAttribute('data-running', 'false')
  await expect(button).toBeEnabled()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components')
  await expect(page.locator('#motion-preview')).toBeDisabled()
  await expect(page.locator('[data-motion-demo]')).toHaveAttribute('data-running', 'false')
})
