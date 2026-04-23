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

  // Retry navigation up to 3 times — demo site can be slow to respond
  let loginLoaded = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${baseURL}${testData.urls.login}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[placeholder="Username"]', { timeout: 15000 });
      loginLoaded = true;
      break;
    } catch {
      console.log(`Login page load attempt ${attempt} failed, retrying...`);
      await page.waitForTimeout(3000);
    }
  }
  if (!loginLoaded) throw new Error('Global setup failed: Could not load login page after 3 attempts');

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