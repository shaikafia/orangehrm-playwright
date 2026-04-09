import { type Page, type Locator, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TIMEOUTS, PAGE_HEADINGS, NAV_LABELS, SELECTORS } from '../utils/constants';

function getEmployeeListUrl(): string {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', '..', 'config', `testdata.${env}.json`);
  return JSON.parse(fs.readFileSync(testDataPath, 'utf8')).urls.employeeList;
}

export class EmployeePage {
  readonly pageHeading: Locator;
  readonly addEmployeeButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly searchButton: Locator;
  readonly employeeNameSearchInput: Locator;
  readonly successToast: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading             = page.getByRole('heading', { name: PAGE_HEADINGS.employeeInformation });
    this.addEmployeeButton       = page.getByRole('button', { name: NAV_LABELS.add });
    this.firstNameInput          = page.locator('input[name="firstName"]');
    this.lastNameInput           = page.locator('input[name="lastName"]');
    this.employeeIdInput         = page.locator(SELECTORS.inputField).nth(1);
    this.saveButton              = page.getByRole('button', { name: NAV_LABELS.save });
    this.searchButton            = page.getByRole('button', { name: NAV_LABELS.search });
    this.employeeNameSearchInput = page.locator(SELECTORS.autocompleteInput).first();
    this.successToast            = page.locator(SELECTORS.successToast);
    this.tableBody               = page.locator(SELECTORS.tableBody);
    this.tableRows               = page.locator(SELECTORS.tableRow);
  }

  async goto() {
    await this.page.goto(getEmployeeListUrl(), { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.page.locator(SELECTORS.tableFilter)).toBeVisible({ timeout: TIMEOUTS.navigation });
  }

  async clickAddEmployee() {
    await this.addEmployeeButton.click();
    await expect(this.firstNameInput).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  async fillEmployeeDetails(firstName: string, lastName: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
  }

  async saveEmployee() {
    await this.saveButton.click();
  }

  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  async searchEmployeeByName(name: string) {
    await this.employeeNameSearchInput.fill(name);
    await this.page.waitForTimeout(TIMEOUTS.autocomplete);
    await this.searchButton.click();
  }

  async getEmployeeRowCount(): Promise<number> {
    await expect(this.tableRows.first()).toBeVisible({ timeout: TIMEOUTS.navigation });
    return await this.tableRows.count();
  }

  async expectEmployeeInResults(name: string) {
    const row = this.tableRows.filter({ hasText: name });
    await expect(row).toBeVisible();
  }
}