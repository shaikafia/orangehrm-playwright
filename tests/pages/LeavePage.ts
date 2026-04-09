import { type Page, type Locator, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TIMEOUTS, PAGE_HEADINGS, NAV_LABELS, SELECTORS } from '../utils/constants';

function getLeaveUrls(): { applyLeave: string; leaveList: string; myLeave: string } {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', '..', 'config', `testdata.${env}.json`);
  const { urls } = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  return { applyLeave: urls.applyLeave, leaveList: urls.leaveList, myLeave: urls.myLeave };
}

export class LeavePage {
  readonly pageHeading: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly applyButton: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly tableBody: Locator;
  readonly tableRows: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading       = page.getByRole('heading', { name: PAGE_HEADINGS.applyLeave });
    this.leaveTypeDropdown = page.locator(SELECTORS.leaveTypeDropdown).first();
    this.applyButton       = page.getByRole('button', { name: NAV_LABELS.apply });
    this.successToast      = page.locator(SELECTORS.successToast);
    this.errorToast        = page.locator(SELECTORS.errorToast);
    this.tableBody         = page.locator(SELECTORS.tableBody);
    this.tableRows         = page.locator(SELECTORS.tableRow);
  }

  async gotoApplyLeave() {
    await this.page.goto(getLeaveUrls().applyLeave, { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  async gotoLeaveList() {
    await this.page.goto(getLeaveUrls().leaveList, { waitUntil: 'domcontentloaded' });
    await this.isLeaveListLoaded();
  }

  async isLeaveListLoaded() {
    await expect(
      this.page.getByRole('link', { name: NAV_LABELS.leave, exact: true })
    ).toBeVisible({ timeout: TIMEOUTS.standard });
  }

  async gotoMyLeave() {
    await this.page.goto(getLeaveUrls().myLeave, { waitUntil: 'domcontentloaded' });
    await this.isLeaveListLoaded();
  }

  async selectLeaveType(leaveType: string) {
    await this.leaveTypeDropdown.click();
    await this.page.getByRole('option', { name: leaveType }).click();
  }

  async setFromDate(date: string) {
    const fromDateInput = this.page.locator(SELECTORS.dateInput).first();
    await fromDateInput.fill(date);
    await fromDateInput.press('Enter');
  }

  async setToDate(date: string) {
    const toDateInput = this.page.locator(SELECTORS.dateInput).nth(1);
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