import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  use: { baseURL: 'http://localhost:8081', viewport: { width: 390, height: 844 }, browserName: 'chromium', channel: 'chrome' },
  webServer: { command: 'npm run web -- --port 8081', url: 'http://localhost:8081', reuseExistingServer: true, timeout: 120000 },
});
