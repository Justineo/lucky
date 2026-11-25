import { defineConfig } from '@playwright/test'

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

export default defineConfig({
  testDir: 'tests/browser',
  forbidOnly: Boolean(process.env.CI),
  use: { baseURL: 'http://127.0.0.1:4173' },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', launchOptions: { executablePath } },
    },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  webServer: {
    command: 'vp preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
