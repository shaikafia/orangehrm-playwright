import { expect } from '@playwright/test';
import { test } from './fixtures/base';
import fs from 'fs';
import path from 'path';
import { NAV_LABELS, SELECTORS } from './utils/constants';

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

test.describe('OrangeHRM - Employee Search Details @regression', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
    await page.goto(testData.urls.employeeList, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(SELECTORS.tableFilter)).toBeVisible({ timeout: testData.navigationTimeout });
  });

  test('[TC-28] should show results when searching by first name', async ({ employeePage, page }) => {
    const profile = testData.searchProfiles[0];
    await employeePage.searchEmployeeByName(profile.firstName);
    await expect(page.locator(SELECTORS.tableFilter)).toBeVisible({ timeout: testData.navigationTimeout });
    const count = await employeePage.getEmployeeRowCount();
    expect(count).toBeGreaterThan(0);
  });

  test('[TC-29] should show results when searching by first name for second profile', async ({ employeePage, page }) => {
    const profile = testData.searchProfiles[1];
    await employeePage.searchEmployeeByName(profile.firstName);
    await expect(page.locator(SELECTORS.tableFilter)).toBeVisible({ timeout: testData.navigationTimeout });
  });

  test('[TC-30] should show Add Employee form with first and last name fields visible', async ({ employeePage, page }) => {
    await employeePage.clickAddEmployee();
    await expect(employeePage.firstNameInput).toBeVisible();
    await expect(employeePage.lastNameInput).toBeVisible();

    await expect(page).toHaveURL(new RegExp(testData.urlPatterns.addEmployee ?? 'addEmployee'));
  });

  test('[TC-31] should return to employee list with results after clicking Search with no filters', async ({ employeePage, page }) => {
    await employeePage.searchButton.click();
    await expect(page.locator(SELECTORS.tableFilter)).toBeVisible({ timeout: testData.navigationTimeout });
    const count = await employeePage.getEmployeeRowCount();
    expect(count).toBeGreaterThan(0);
  });
});
