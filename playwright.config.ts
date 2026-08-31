import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  /* Tests must be independent, so they can safely run in parallel. */
  fullyParallel: true,

  /* Fail the CI build if a test.only was committed by accident. */
  forbidOnly: isCI,

  /* Retry on CI only — locally a flake should be seen, not hidden. */
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  /* Fail fast on a hanging assertion rather than waiting out the test timeout. */
  expect: { timeout: 7_000 },
  timeout: 45_000,

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',

    /* Sauce Demo ships data-test attributes, so getByTestId targets them
       instead of the Playwright default of data-testid. */
    testIdAttribute: 'data-test',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
