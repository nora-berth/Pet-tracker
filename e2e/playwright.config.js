import { defineConfig, devices } from '@playwright/test';

const crossBrowser = process.env.CROSS_BROWSER === 'true';

const projects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
];

if (crossBrowser || !process.env.CI) {
  projects.push(
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  );
}

if (!process.env.CI) {
  projects.push({
    name: 'edge',
    use: { ...devices['Desktop Edge'], channel: 'msedge' },
  });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['allure-playwright', {
      resultsDir: 'allure-results-e2e',
      suiteTitle: false,
    }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects,

  webServer: {
    command: 'npm run dev --prefix ../frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
