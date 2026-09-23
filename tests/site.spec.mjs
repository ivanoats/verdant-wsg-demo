import { test, expect } from '@playwright/test'
import { highContrastTokens, themeTokens } from 'verdant-design/theme'

// WCAG relative-luminance contrast between two computed rgb()/rgba() colors.
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

const underline = (locator) => locator.evaluate((link) => getComputedStyle(link).textDecorationLine)
const expectNoHorizontalScroll = async (page) => {
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1)
}
const rootAttr = (page, name) => page.evaluate((attr) => document.documentElement.getAttribute(attr), name)

test('a11y affordances stay visible at narrow widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/components')

  const field = page.locator('#site-url')
  const describedBy = await field.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  for (const id of describedBy.trim().split(/\s+/)) {
    await expect(page.locator(`#${id}`)).toBeVisible()
    await expect(page.locator(`#${id}`)).not.toHaveText('')
  }
  await expectNoHorizontalScroll(page)

  // The placeholder is measured against the first opaque background behind the field.
  const placeholder = await field.evaluate((input) => {
    let node = input
    let background = 'rgba(0, 0, 0, 0)'
    while (node && /rgba\(.*,\s*0\)$|transparent/.test(background)) {
      background = getComputedStyle(node).backgroundColor
      node = node.parentElement
    }
    return { foreground: getComputedStyle(input, '::placeholder').color, background }
  })
  expect(contrast(placeholder)).toBeGreaterThanOrEqual(4.5)

  await page.goto('/')
  const proseLink = page.locator('main').getByRole('link', { name: 'W3C Web Sustainability Guidelines', exact: true }).first()
  await expect(proseLink).toBeVisible()
  expect(await underline(proseLink)).toContain('underline')

  await expectNoHorizontalScroll(page)

  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: /skip to content/i })
  await expect(skipLink).toBeFocused()
  await expect.poll(() => skipLink.evaluate((link) => link.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)

  const response = await page.goto('/missing-route')
  expect(response?.status()).toBe(404)
  const recoveryLink = page.getByRole('link', { name: /back to the overview/i })
  await expect(recoveryLink).toBeVisible()
  expect(await underline(recoveryLink)).toContain('underline')
})

test('theme preference persists and system mode tracks OS changes', async ({ page }) => {
  const choice = (value) => page.locator(`input[name="theme-preference"][value="${value}"]`)
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/components')

  await choice('dark').check()
  await expect.poll(() => rootAttr(page, 'data-theme-resolved')).toBe('dark')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('verdant-theme-preference'))).toBe('dark')

  // An explicit choice ignores the OS preference and survives navigation.
  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => rootAttr(page, 'data-theme-resolved')).toBe('dark')
  await page.goto('/')
  await expect(choice('dark')).toBeChecked()
  expect(await rootAttr(page, 'data-theme-override')).toBe('dark')

  // System hands control back to prefers-color-scheme, live.
  await choice('system').check()
  await expect.poll(() => rootAttr(page, 'data-theme-resolved')).toBe('light')
  expect(await rootAttr(page, 'data-theme-override')).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('verdant-theme-preference'))).toBeNull()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect.poll(() => rootAttr(page, 'data-theme-resolved')).toBe('dark')
})

test('motion preview is bounded and reduced-motion safe', async ({ page }) => {
  const spinnerClass = () => page.locator('#demo-spinner').getAttribute('class')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/components')

  const button = page.locator('#motion-preview')
  const status = page.locator('#motion-preview-status')
  await expect(status).toHaveText(/static by default/i)

  await button.click()
  await expect(status).toHaveText(/preview running/i)
  expect(await spinnerClass()).toContain('spinner--preview_true')
  // The preview stops on its own after about four seconds.
  await expect(status).toHaveText(/preview finished/i, { timeout: 8000 })
  expect(await spinnerClass()).not.toContain('spinner--preview_true')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components')
  await expect(status).toHaveText(/reduced motion is enabled/i)
  await button.click()
  await expect(status).toHaveText(/reduced motion is enabled/i)
  expect(await spinnerClass()).not.toContain('spinner--preview_true')
})

test('increased contrast swaps in stronger tokens and thicker boundaries', async ({ page }) => {
  const tokenValue = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--colors-ink-muted').trim())
  const borderWidth = () => page.locator('#site-url').evaluate((input) => getComputedStyle(input).borderTopWidth)
  const choice = (value) => page.locator(`input[name="theme-preference"][value="${value}"]`)

  await page.emulateMedia({ colorScheme: 'light', contrast: 'more' })
  await page.goto('/components')
  expect(await tokenValue()).toBe(highContrastTokens['ink.muted'].light)
  expect(await borderWidth()).toBe('2px')

  // System mode follows the OS into dark, still with the stronger set.
  await page.emulateMedia({ colorScheme: 'dark', contrast: 'more' })
  await expect.poll(tokenValue).toBe(highContrastTokens['ink.muted'].dark)

  // An explicit theme choice keeps the stronger set for that theme.
  await choice('light').check()
  await expect.poll(tokenValue).toBe(highContrastTokens['ink.muted'].light)

  // Without the preference, the explicit theme's standard values return.
  await page.emulateMedia({ contrast: 'no-preference' })
  await expect.poll(tokenValue).toBe(themeTokens['ink.muted'].light)
  expect(await borderWidth()).toBe('1px')
})

test('the hero links to the green web page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'What is the green web?' }).click()
  await expect(page).toHaveURL(/\/green-web$/)
  await expect(page.getByRole('heading', { level: 1, name: 'What is the Green Web?' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', 'https://sustainaweb.netlify.app/contact')
  await page.setViewportSize({ width: 320, height: 900 })
  await expectNoHorizontalScroll(page)
})
