import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// The theme runtime published in verdant-design is a separate file from the
// site's own inline copy, so the site's theme tests never exercise it. These
// tests load the published file the way docs/INSTALL.md tells consumers to —
// synchronously in <head>, with the documented radio markup — and check the
// contract that the preset's globalCss depends on.
//
// Routes are fulfilled on the dev server's origin rather than a data: URL so
// that localStorage behaves normally.
const runtime = readFileSync('packages/verdant-design/src/theme-toggle.js', 'utf8')

const FIXTURE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="theme-color" content="#faf8f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15140f" media="(prefers-color-scheme: dark)">
<script src="/__verdant-theme-toggle.js"></script></head>
<body><fieldset aria-label="Theme preference"><legend>Theme</legend>
<label for="t-system"><input type="radio" id="t-system" name="theme-preference" value="system" checked><span>System</span></label>
<label for="t-light"><input type="radio" id="t-light" name="theme-preference" value="light"><span>Light</span></label>
<label for="t-dark"><input type="radio" id="t-dark" name="theme-preference" value="dark"><span>Dark</span></label>
</fieldset></body></html>`

const FIXTURE_URL = 'http://127.0.0.1:4173/__verdant-theme-fixture.html'

test.beforeEach(async ({ page }) => {
  await page.route('**/__verdant-theme-fixture.html', (route) =>
    route.fulfill({ contentType: 'text/html', body: FIXTURE }))
  await page.route('**/__verdant-theme-toggle.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: runtime }))
})

const themeState = (page) => page.evaluate(() => ({
  preference: document.documentElement.getAttribute('data-theme-preference'),
  resolved: document.documentElement.getAttribute('data-theme-resolved'),
  override: document.documentElement.getAttribute('data-theme-override'),
}))

test.describe('published theme runtime', () => {
  test('System follows prefers-color-scheme and sets no override', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(FIXTURE_URL)
    expect(await themeState(page)).toEqual({ preference: 'system', resolved: 'dark', override: null })
  })

  test('an explicit choice sets the override the preset keys off', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(FIXTURE_URL)
    await page.click('#t-light')
    expect(await themeState(page)).toEqual({ preference: 'light', resolved: 'light', override: 'light' })
  })

  test('an explicit choice pins every theme-color meta, System restores them', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(FIXTURE_URL)
    await page.click('#t-light')
    const pinned = await page.$$eval('meta[name="theme-color"]', (m) => m.map((x) => ({
      content: x.getAttribute('content'), media: x.getAttribute('media'),
    })))
    expect(pinned.every((m) => m.content === '#faf8f3' && m.media === null)).toBe(true)

    await page.click('#t-system')
    const restored = await page.$$eval('meta[name="theme-color"]', (m) => m.map((x) => x.getAttribute('media')))
    expect(restored.every(Boolean)).toBe(true)
  })

  test('the choice survives a reload and the control re-syncs', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(FIXTURE_URL)
    await page.click('#t-light')
    await page.reload()
    expect((await themeState(page)).override).toBe('light')
    await expect(page.locator('#t-light')).toBeChecked()
  })

  test('returning to System clears the override', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(FIXTURE_URL)
    await page.click('#t-light')
    await page.click('#t-system')
    expect(await themeState(page)).toEqual({ preference: 'system', resolved: 'dark', override: null })
  })

  test('live System mode follows a change in the OS preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(FIXTURE_URL)
    expect((await themeState(page)).resolved).toBe('light')
    await page.emulateMedia({ colorScheme: 'dark' })
    // The change arrives through a media-query listener, so poll rather than
    // assert on the next tick.
    await expect.poll(async () => (await themeState(page)).resolved).toBe('dark')
  })

  test('blocked localStorage degrades to System instead of throwing', async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
    })
    await page.goto(FIXTURE_URL)
    expect(errors).toEqual([])
    expect((await themeState(page)).resolved).toBe('light')
  })
})
