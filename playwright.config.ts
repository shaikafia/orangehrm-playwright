import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

export default defineConfig({
  // No globalSetup needed — each test group logs in fresh via beforeEach.
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: testData.navigationTimeout,
  reporter: process.env.CI
    ? [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : 'html',
  use: {
    baseURL: testData.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
    // NO storageState here — the demo site rejects saved sessions instantly.
    // Each authenticated describe block logs in fresh via beforeEach instead.
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
