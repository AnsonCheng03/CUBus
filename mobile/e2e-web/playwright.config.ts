import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  use: {
    ...devices['iPhone 13'],
    baseURL: 'http://127.0.0.1:19007',
  },
  webServer: {
    command:
      'CI=1 EXPO_PUBLIC_E2E_MODE=1 EXPO_PUBLIC_E2E_SCENARIO=route-search npm run web -- --port 19007',
    url: 'http://127.0.0.1:19007',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
