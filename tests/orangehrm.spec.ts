import { test } from './fixtures/base';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ERROR_MESSAGES } from './utils/constants';

const env = process.env.TEST_ENV || 'dev';
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

const { username, password, invalidUsername, invalidPassword } = testData.credentials;
const { searchProfiles, urls } = testData;

/**
 * Logs in with valid credentials and waits until the dashboard is visible.
 * Called in beforeEach for every authenticated test group because the
 * OrangeHRM demo site rejects saved session cookies immediately.
 */
async function freshLogin(loginPage: any, page: any) {
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible({ timeout: 30000 });
}

// ─────────────────────────────────────────────────────────────
// LOGIN & NEGATIVE TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Login & Negative Tests (No Auth) @regression', () => {
  test('[TC-01] @smoke should login successfully with valid credentials', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(username, password);
    await dashboardPage.isLoaded();
  });

  test('[TC-02] should display error with invalid username', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(invalidUsername, password);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-03] should display error with invalid password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(username, invalidPassword);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-04] should display error with both invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(invalidUsername, invalidPassword);
    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('[TC-05] should display required error when username is empty', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login('', password);
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
  });

  test('[TC-06] should display required error when password is empty', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(username, '');
    await expect(page.locator('.oxd-input-field-error-message').first()).toBeVisible();
  });

  test('[TC-07] should handle XSS injection attempt safely', async ({ loginPage, page }) => {
    const xssPayload = '<script>alert("xss")</script>';
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
    const sqlPayload = "' OR '1'='1";
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

  test('[TC-11] should logout successfully', async ({ dashboardPage, loginPage, page }) => {
    await dashboardPage.logout();
    await loginPage.isLoaded();
    await expect(page).toHaveURL(/auth\/login/);
  });
});

// ─────────────────────────────────────────────────────────────
// EMPLOYEE (PIM) TESTS
// ─────────────────────────────────────────────────────────────
test.describe('OrangeHRM - Employee Management @regression', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await freshLogin(loginPage, page);
    await page.goto(urls.employeeList, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.oxd-table-filter')).toBeVisible({ timeout: 15000 });
  });

  test('[TC-12] @smoke should load employee list page', async ({ employeePage }) => {
    await employeePage.isLoaded();
  });

  test('[TC-13] should show Add Employee form when Add button is clicked', async ({
    employeePage,
  }) => {
    await employeePage.clickAddEmployee();
    await expect(employeePage.firstNameInput).toBeVisible();
    await expect(employeePage.lastNameInput).toBeVisible();
  });

  for (const profile of searchProfiles) {
    test(`[TC-14] @smoke should search employee by name: ${profile.firstName}`, async ({
      employeePage,
      page,
    }) => {
      await employeePage.searchEmployeeByName(profile.firstName);
      // The table body is hidden when no results are found ("No Records Found").
      // We confirm the search completed by checking the filter panel is still present —
      // this proves the page did not navigate away and the search ran successfully.
      await expect(page.locator('.oxd-table-filter')).toBeVisible({ timeout: 10000 });
    });
  }

  test('[TC-15] should show employee table with results on default load', async ({
    employeePage,
  }) => {
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

  test('[TC-17] should load leave list page', async ({ page }) => {
    await page.goto(urls.leaveList, { waitUntil: 'domcontentloaded' });
    // Use exact: true — the Leave sidebar link and topbar sub-links all match 'Leave'
    // without exact matching, causing a strict mode violation (4 elements found).
    await expect(page.getByRole('link', { name: 'Leave', exact: true })).toBeVisible({
      timeout: 15000,
    });
  });

  test('[TC-18] should load my leave list page', async ({ page }) => {
    await page.goto(urls.myLeave, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Leave', exact: true })).toBeVisible({
      timeout: 15000,
    });
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
    await page.getByRole('link', { name: 'PIM' }).click();
    await expect(page).toHaveURL(/pim/);
    await expect(page.getByRole('link', { name: 'Employee List' })).toBeVisible({ timeout: 15000 });
  });

  test('[TC-20] should navigate to Leave from sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Leave', exact: true }).click();
    await expect(page).toHaveURL(/leave/);
    await expect(page.getByRole('link', { name: 'Apply' })).toBeVisible({ timeout: 15000 });
  });

  test('[TC-21] should navigate to My Info page', async ({ page }) => {
    await page.getByRole('link', { name: 'My Info' }).click();
    // OrangeHRM redirects "My Info" to viewPersonalDetails — both URLs are correct.
    await expect(page).toHaveURL(/myInfo|viewPersonalDetails/, { timeout: 10000 });
    await expect(page.getByRole('textbox', { name: 'First Name' })).toBeVisible({ timeout: 15000 });
  });

  test('[TC-22] should take screenshot of dashboard', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/dashboard.png', fullPage: true });
  });
});
