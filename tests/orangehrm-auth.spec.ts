import { expect } from '@playwright/test';
import { test } from './fixtures/base';
import fs from 'fs';
import path from 'path';
import { NAV_LABELS } from './utils/constants';

function loadTestData() {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  return JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
}

const testData = loadTestData();
const { username, password } = testData.credentials;

async function freshLogin(loginPage: any, page: any) {
  await page.context().clearCookies();
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page.getByRole('link', { name: NAV_LABELS.dashboard })).toBeVisible({ timeout: testData.loginTimeout });
}


test.describe('OrangeHRM - Auth & Route Protection @regression', () => {

  test.describe('Unauthenticated', () => {
  
    test.use({ storageState: { cookies: [], origins: [] } });

    test('[TC-23] should block direct access to dashboard when not authenticated', async ({ page, loginPage }) => {
      await page.goto(testData.urls.dashboard, { waitUntil: 'domcontentloaded' });
      await loginPage.isLoaded();
      await expect(page).not.toHaveURL(new RegExp(testData.urlPatterns.dashboard));
    });

    test('[TC-24] should block direct access to employee list when not authenticated', async ({ page, loginPage }) => {
      await page.goto(testData.urls.employeeList, { waitUntil: 'domcontentloaded' });
      await loginPage.isLoaded();
      await expect(page).not.toHaveURL(new RegExp(testData.urlPatterns.pim));
    });

    test('[TC-25] should block direct access to leave page when not authenticated', async ({ page, loginPage }) => {
      await page.goto(testData.urls.applyLeave, { waitUntil: 'domcontentloaded' });
      await loginPage.isLoaded();
      await expect(page).not.toHaveURL(new RegExp(testData.urlPatterns.leave));
    });
  });

  test('[TC-26] should allow logout and block protected routes afterwards', async ({
    page, dashboardPage, loginPage,
  }) => {

    await freshLogin(loginPage, page);
    await dashboardPage.isLoaded();

    await dashboardPage.logout();
    await expect(page).toHaveURL(new RegExp(testData.urlPatterns.login));

 
    await page.goto(testData.urls.employeeList, { waitUntil: 'domcontentloaded' });
    await loginPage.isLoaded();
    await expect(page).not.toHaveURL(new RegExp(testData.urlPatterns.pim));
  });

  test('[TC-27] should require login if auth cookies are cleared mid-session', async ({
    page, dashboardPage, loginPage,
  }) => {

    await freshLogin(loginPage, page);
    await dashboardPage.isLoaded();

    await page.context().clearCookies();
    await page.goto(testData.urls.employeeList, { waitUntil: 'domcontentloaded' });

    await loginPage.isLoaded();
    await expect(page).not.toHaveURL(new RegExp(testData.urlPatterns.pim));
  });
});
