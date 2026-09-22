import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'site.spec.mjs',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  reporter: process.env.CI ? [['line'], ['json', { outputFile: 'artifacts/playwright-report.json' }]] : 'list',
})
