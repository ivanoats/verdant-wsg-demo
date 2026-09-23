import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  // One folder of baselines, named by specimen and mode. They are rendered on
  // the pinned CI runner (ubuntu-24.04), so compare there, not on a laptop.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } },
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
