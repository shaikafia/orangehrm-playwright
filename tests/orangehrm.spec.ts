import { test } from './fixtures/base';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ERROR_MESSAGES, TEST_PAYLOADS, NAV_LABELS } from './utils/constants';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const { username, password, invalidUsername, invalidPassword } = testData.credentials;
const { searchProfiles, urls, urlPatterns, loginTimeout, shortTimeout, navigationTimeout } = testData;

/**
 * Logs in fresh before each authenticated test group.
 * Uses loginPage.goto() with no URL argument — baseURL is set in playwright.config.ts.
 * loginTimeout loaded from testdata JSON — not hardcoded.
 */
async function freshLogin(loginPage: any, page: any) {
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page.getByRole('link', { name: NAV_LABELS.dashboard })).toBeVisible({ timeout: loginTimeout });
}

// ─────────────────────────────────────────────────────────────
// LOGIN & NEGATIVE TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Login & Negative Tests (No Auth) @regression', () => {
  // Clear authentication state for all login tests — matching sir's pattern
  test.use({ storageState: { cookies: [], origins: [] } });

  // Data-driven invalid login scenarios — matching sir's pattern from saucedemo-purchase.spec.ts
  const invalidLoginScenarios = [
    { id: 'TC-02', type: 'invalid username',       user: invalidUsername, pass: password,        error: ERROR_MESSAGES.invalidCredentials },
    { id: 'TC-03', type: 'invalid password',       user: username,        pass: invalidPassword, error: ERROR_MESSAGES.invalidCredentials },
    { id: 'TC-04', type: 'both invalid credentials', user: invalidUsername, pass: invalidPassword, error: ERROR_MESSAGES.invalidCredentials },
  ];

  test('[TC-01] @smoke should login successfully with valid credentials', async ({
    loginPage, dashboardPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(username, password);
    await dashboardPage.isLoaded();
  });

  for (const scenario of invalidLoginScenarios) {
    test(`[${scenario.id}] should display error for ${scenario.type}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(scenario.user, scenario.pass);
      await loginPage.expectErrorMessage(scenario.error);
    });
  }

  test('[TC-05] should display required error when username is empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', password);
    await loginPage.expectFieldError();
  });

  test('[TC-06] should display required error when password is empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(username, '');
    await loginPage.expectFieldError();
  });

  test('[TC-07] should handle XSS injection attempt safely', async ({ loginPage, page }) => {
    const xssPayload = TEST_PAYLOADS.xss;
    let xssExecuted = false;
    page.on('dialog', async (dialog: any) => {
      xssExecuted = true;
      await dialog.dismiss();
    });
    await loginPage.goto();
    await loginPage.login(xssPayload, password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
    expect(xssExecuted).toBe(false);
  });

  test('[TC-08] should handle SQL injection attempt safely', async ({ loginPage }) => {
    const sqlPayload = TEST_PAYLOADS.sql;
    await loginPage.goto();
    await loginPage.login(sqlPayload, password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });
});

// ─────────────────────────────────────────────────────────────
// DASHBOARD TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Dashboard (Authenticated) @regression', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
  });

  test('[TC-09] @smoke should load dashboard after login', async ({ dashboardPage }) => {
    await dashboardPage.isLoaded();
  });

  test('[TC-10] should display the correct logged-in username', async ({ dashboardPage }) => {
    const name = await dashboardPage.getLoggedInUsername();
    expect(name.length).toBeGreaterThan(0);
  });

  test('[TC-11] should logout successfully', async ({ dashboardPage, page }) => {
    await dashboardPage.logout();
    await expect(page).toHaveURL(new RegExp(urlPatterns.login));
  });
});

// ─────────────────────────────────────────────────────────────
// EMPLOYEE (PIM) TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Employee Management @regression', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
    await page.goto(urls.employeeList, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.oxd-table-filter')).toBeVisible({ timeout: navigationTimeout });
  });

  test('[TC-12] @smoke should load employee list page', async ({ employeePage }) => {
    await employeePage.isLoaded();
  });

  test('[TC-13] should show Add Employee form when Add button is clicked', async ({ employeePage }) => {
    await employeePage.clickAddEmployee();
    await expect(employeePage.firstNameInput).toBeVisible();
    await expect(employeePage.lastNameInput).toBeVisible();
  });

  // Data-driven search — matching sir's pattern from inventory-details.spec.ts
  for (const profile of searchProfiles) {
    test(`[TC-14] @smoke should search employee by name: ${profile.firstName}`, async ({
      employeePage, page,
    }) => {
      await employeePage.searchEmployeeByName(profile.firstName);
      await expect(page.locator('.oxd-table-filter')).toBeVisible({ timeout: navigationTimeout });
    });
  }

  test('[TC-15] should show employee table with results on default load', async ({ employeePage }) => {
    await employeePage.searchButton.click();
    const count = await employeePage.getEmployeeRowCount();
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// LEAVE MODULE TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Leave Module @regression', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
  });

  test('[TC-16] @smoke should load apply leave page', async ({ leavePage }) => {
    await leavePage.gotoApplyLeave();
    await leavePage.isLoaded();
  });

  test('[TC-17] should load leave list page', async ({ leavePage }) => {
    await leavePage.gotoLeaveList();
    await leavePage.isLeaveListLoaded();
  });

  test('[TC-18] should load my leave list page', async ({ leavePage }) => {
    await leavePage.gotoMyLeave();
    await leavePage.isLeaveListLoaded();
  });
});

// ─────────────────────────────────────────────────────────────
// NAVIGATION TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Navigation @regression', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
  });

  test('[TC-19] @smoke should navigate to PIM from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: NAV_LABELS.pim }).click();
    await expect(page).toHaveURL(new RegExp(urlPatterns.pim));
    await expect(page.getByRole('link', { name: NAV_LABELS.employeeList })).toBeVisible({ timeout: navigationTimeout });
  });

  test('[TC-20] should navigate to Leave from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: NAV_LABELS.leave, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(urlPatterns.leave));
    await expect(page.getByRole('link', { name: NAV_LABELS.apply })).toBeVisible({ timeout: navigationTimeout });
  });

  test('[TC-21] should navigate to My Info page', async ({ page }) => {
    await page.getByRole('link', { name: NAV_LABELS.myInfo }).click();
    await expect(page).toHaveURL(new RegExp(urlPatterns.myInfo), { timeout: shortTimeout });
    await expect(page.getByRole('textbox', { name: NAV_LABELS.firstName })).toBeVisible({ timeout: navigationTimeout });
  });

  test('[TC-22] should take screenshot of dashboard', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/dashboard.png', fullPage: true });
  });
});
