import { type Page, type Locator, expect } from '@playwright/test';

export class LeavePage {
  readonly pageHeading: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.getByRole('heading', { name: 'Apply Leave' });
    this.leaveTypeDropdown = page.locator('.oxd-select-text').first();
    this.applyButton = page.getByRole('button', { name: 'Apply' });
    this.successToast = page.locator('.oxd-toast-content--success');
    this.errorToast = page.locator('.oxd-toast-content--error');
    this.tableBody = page.locator('.oxd-table-body');
    this.tableRows = page.locator('.oxd-table-row--with-border');
  }

  async gotoApplyLeave() {
    await this.page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    // Check for the Apply Leave page heading — this is unique to the Apply Leave page
    // and only visible when the user is properly authenticated and on this page.
    await expect(this.pageHeading).toBeVisible({ timeout: 15000 });
  }

  async selectLeaveType(leaveType: string) {
    await this.leaveTypeDropdown.click();
    await this.page.getByRole('option', { name: leaveType }).click();
  }

  async setFromDate(date: string) {
    const fromDateInput = this.page.locator('.oxd-date-input input').first();
    await fromDateInput.fill(date);
    await fromDateInput.press('Enter');
  }

  async setToDate(date: string) {
    const toDateInput = this.page.locator('.oxd-date-input input').nth(1);
    await toDateInput.fill(date);
    await toDateInput.press('Enter');
  }

  async clickApply() {
    await this.applyButton.click();
  }

  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  async getLeaveListRowCount(): Promise<number> {
    await expect(this.tableBody).toBeVisible();
    return await this.tableRows.count();
  }
}
