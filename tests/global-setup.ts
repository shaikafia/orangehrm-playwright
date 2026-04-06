import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config: FullConfig) {
  const env = process.env.TEST_ENV || 'dev';
  console.log('env is: ', env);

  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

  const { username, password } = testData.credentials;
  const baseURL = testData.baseUrl;

  // Build the auth file path using __dirname so it always resolves to the
  // correct absolute location: <project-root>/.auth/user.json
  // This must match the authStatePath in playwright.config.ts exactly.
  const authDirPath = path.resolve(__dirname, '..', '.auth');
  const authFilePath = path.join(authDirPath, 'user.json');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Use navigationTimeout from config — no hardcoding
  page.setDefaultNavigationTimeout(testData.navigationTimeout);

  await page.goto(`${baseURL}/web/index.php/auth/login`, { waitUntil: 'domcontentloaded' });

  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);

  // Wait until the dashboard topbar is visible — confirms login succeeded.
  // If login fails (wrong credentials, network issue), this will throw and
  // abort the entire test run with a clear error rather than silently saving
  // a logged-out auth state.
  await page.waitForSelector('.oxd-topbar-header', { timeout: testData.navigationTimeout });

  // Additional check: confirm we are NOT still on the login page
  const currentUrl = page.url();
  if (currentUrl.includes('/auth/login')) {
    throw new Error(
      `Global setup failed: Login did not succeed. Still on login page. ` +
      `Check credentials in config/testdata.${env}.json`
    );
  }

  // Create .auth directory if it doesn't exist
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath, { recursive: true });
  }

  // Save authenticated browser state to the absolute path.
  // All tests pick this up via storageState in playwright.config.ts.
  await page.context().storageState({ path: authFilePath });
  await browser.close();

  console.log(`Global setup complete — auth state saved to: ${authFilePath}`);
}

export default globalSetup;
