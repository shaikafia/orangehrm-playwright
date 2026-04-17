import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { AUTH_CONFIG } from './tests/utils/constants';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

export default defineConfig({
  globalSetup: require.resolve('./tests/global-setup'),
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: testData.workers,
  reporter: process.env.CI
    ? [['line'], ['junit', { outputFile: 'test-results/junit.xml' }], ['html', { open: 'never' }]]
    : 'html',
  use: {
    baseURL: testData.baseUrl,
    trace: 'on-first-retry',
    navigationTimeout: testData.navigationTimeout,
    actionTimeout: testData.loginTimeout,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: testData.HEADLESS, // controlled by testdata — not hardcoded
    storageState: AUTH_CONFIG.path, // AUTH_CONFIG from constants — not hardcoded
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: testData.visualThresholds.maxDiffPixels,
      maxDiffPixelRatio: testData.visualThresholds.maxDiffPixelRatio,
      threshold: testData.visualThresholds.threshold,
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
