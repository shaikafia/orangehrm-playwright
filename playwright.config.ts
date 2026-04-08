import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const headless = testData.HEADLESS;

export default defineConfig({
  globalSetup: require.resolve('./tests/global-setup'),
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: testData.workers,
  reporter: process.env.CI
    ? [['line'], ['junit', { outputFile: 'test-results/junit.xml' }], ['html', { open: 'never' }]]
    : 'html',
  use: {
    baseURL: testData.baseUrl,
    trace: 'on-first-retry',
    navigationTimeout: 45_000,
    actionTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: headless,
    storageState: '.auth/user.json',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels:     testData.visualThresholds.maxDiffPixels,
      maxDiffPixelRatio: testData.visualThresholds.maxDiffPixelRatio,
      threshold:         testData.visualThresholds.threshold,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: testData.visualThresholds.maxDiffPixelRatio,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
