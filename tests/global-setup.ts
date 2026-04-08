import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config: FullConfig) {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

  const { username, password } = testData.credentials;
  const baseURL = testData.baseUrl;

  const authDirPath  = path.resolve(__dirname, '..', '.auth');
  const authFilePath = path.join(authDirPath, 'user.json');

  const browser = await chromium.launch();
  const page    = await browser.newPage();

  // In global-setup, baseURL is not set via config — navigate using full URL from testdata
  await page.goto(`${baseURL}${testData.urls.login}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);

  // Wait for dashboard topbar to confirm login succeeded
  await page.waitForSelector('.oxd-topbar-header', { timeout: 60_000 });

  // Confirm we are NOT still on the login page
  const currentUrl = page.url();
  if (currentUrl.includes(testData.urlPatterns.login)) {
    throw new Error(
      `Global setup failed: Login did not succeed. Still on login page. ` +
      `Check credentials in config/testdata.${env}.json`
    );
  }

  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  await page.context().storageState({ path: authFilePath });
  await browser.close();
}

export default globalSetup;
