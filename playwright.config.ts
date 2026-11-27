import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
  ],
  webServer: { command: 'pnpm --filter @modfoundry/web exec next start -H 127.0.0.1 -p 3000', url: 'http://127.0.0.1:3000', reuseExistingServer: false, timeout: 30000 }
});
