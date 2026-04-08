import { type Page, type Locator, expect } from '@playwright/test';
import { TIMEOUTS, PAGE_HEADINGS, NAV_LABELS } from '../utils/constants';

export class LeavePage {
  readonly pageHeading: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.getByRole('heading', { name: PAGE_HEADINGS.applyLeave });
    this.leaveTypeDropdown = page.locator('.oxd-select-text').first();
    this.applyButton = page.getByRole('button', { name: NAV_LABELS.apply });
    this.successToast = page.locator('.oxd-toast-content--success');
    this.errorToast = page.locator('.oxd-toast-content--error');
    this.tableBody = page.locator('.oxd-table-body');
    this.tableRows = page.locator('.oxd-table-row--with-border');
  }

  async gotoApplyLeave() {
    // No URL argument — navigates to apply leave path directly
    await this.page.goto('/web/index.php/leave/applyLeave', { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  async gotoLeaveList() {
    // No URL argument — navigates to leave list path directly
    await this.page.goto('/web/index.php/leave/viewLeaveList', { waitUntil: 'domcontentloaded' });
    await this.isLeaveListLoaded();
  }

  async isLeaveListLoaded() {
    // exact: true — multiple 'Leave' links exist in sidebar + topbar
    await expect(
      this.page.getByRole('link', { name: NAV_LABELS.leave, exact: true })
    ).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  async gotoMyLeave() {
    // No URL argument — navigates to my leave list path directly
    await this.page.goto('/web/index.php/leave/viewMyLeaveList', { waitUntil: 'domcontentloaded' });
    await this.isLeaveListLoaded();
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
