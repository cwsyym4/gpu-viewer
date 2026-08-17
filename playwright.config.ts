import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'fs'
const webCommand = process.env.PLAYWRIGHT_WEB_COMMAND ?? (process.env.CI ? 'bun run start' : 'bun run dev')

function resolveChromePath(): string | undefined {
  if (process.env.PW_CHROME_PATH && existsSync(process.env.PW_CHROME_PATH)) return process.env.PW_CHROME_PATH
  const candidates = [
    '/home/hatch/.cache/ms-playwright/chromium-1161/chrome-linux/chrome',
    '/home/hatch/.cache/ms-playwright/chromium-1161/chrome-linux64/chrome',
    '/home/hatch/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    '/home/hatch/.cache/ms-playwright/chromium-1234/chrome-linux/chrome',
    `${process.env.HOME}/workspace/.pw-browsers/chromium-1161/chrome-linux/chrome`,
    `${process.env.HOME}/workspace/.pw-browsers/chromium-1234/chrome-linux64/chrome`,
    '/tmp/pw-browsers/chromium-1161/chrome-linux/chrome',
    '/usr/bin/chromium',
  ]
  for (const p of candidates) if (existsSync(p)) return p
  return undefined
}
const launchOpts: any = {}
const chromePath = resolveChromePath()
if (chromePath) launchOpts.executablePath = chromePath

export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0, workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { ...(chromePath ? { launchOptions: launchOpts } : {}), baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000', trace: 'on-first-retry', actionTimeout: 10000, contextOptions: { reducedMotion: 'reduce' } },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }, { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } }],
  webServer: { command: webCommand, url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 120000 },
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.02, threshold: 0.15 } }
})
