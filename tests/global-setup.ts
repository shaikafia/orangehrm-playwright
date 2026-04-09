import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';
import { AUTH_CONFIG, SELECTORS } from './utils/constants';

async function globalSetup(config: FullConfig) {
  const env = process.env.TEST_ENV || 'dev';
  console.log('env is: ', env);

  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

  const { username, password } = testData.credentials;
  const baseURL = testData.baseUrl;

  const authDirPath  = path.resolve(__dirname, '..', AUTH_CONFIG.dir);
  const authFilePath = path.join(authDirPath, AUTH_CONFIG.file);

  const browser = await chromium.launch();
  const page    = await browser.newPage();

  page.setDefaultNavigationTimeout(testData.navigationTimeout);

  await page.goto(`${baseURL}${testData.urls.login}`, { waitUntil: 'domcontentloaded' });

  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);


  await page.waitForSelector(SELECTORS.topbarHeader, { timeout: testData.navigationTimeout });

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

  console.log(`Global setup complete — auth state saved to: ${authFilePath}`);
}

export default globalSetup;