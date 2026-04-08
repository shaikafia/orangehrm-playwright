import { type Page, type Locator, expect } from '@playwright/test';
import { TIMEOUTS, PAGE_HEADINGS } from '../utils/constants';

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
    this.pageHeading = page.getByRole('heading', { name: PAGE_HEADINGS.employeeInformation });
    this.addEmployeeButton = page.getByRole('button', { name: 'Add' });
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.employeeIdInput = page.locator('.oxd-input').nth(1);
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.employeeNameSearchInput = page.locator('.oxd-autocomplete-text-input input').first();
    this.successToast = page.locator('.oxd-toast-content--success');
    this.tableBody = page.locator('.oxd-table-body');
    this.tableRows = page.locator('.oxd-table-row--with-border');
  }

  async goto() {
    // No URL argument — navigates to employee list path directly
    await this.page.goto('/web/index.php/pim/viewEmployeeList', { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.page.locator('.oxd-table-filter')).toBeVisible({ timeout: TIMEOUTS.standard });
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
    await expect(this.tableBody).toBeVisible();
    return await this.tableRows.count();
  }

  async expectEmployeeInResults(name: string) {
    const row = this.tableRows.filter({ hasText: name });
    await expect(row).toBeVisible();
  }
}
