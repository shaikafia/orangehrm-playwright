import { type Page, type Locator, expect } from '@playwright/test';
import { NAV_LABELS } from '../utils/constants';

export class DashboardPage {
  readonly dashboardHeading: Locator;
  readonly userDropdown: Locator;
  readonly logoutOption: Locator;
  readonly userDropdownName: Locator;

  constructor(private readonly page: Page) {
    // NAV_LABELS.dashboard used — not a hardcoded string
    this.dashboardHeading = page.getByRole('heading', { name: NAV_LABELS.dashboard });
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutOption = page.getByRole('menuitem', { name: 'Logout' });
    this.userDropdownName = page.locator('.oxd-userdropdown-name');
  }

  async isLoaded() {
    // NAV_LABELS.dashboard used — not a hardcoded string
    await expect(this.page.getByRole('link', { name: NAV_LABELS.dashboard })).toBeVisible();
  }

  async navigateTo(menuItem: string) {
    await this.page.getByRole('link', { name: menuItem }).click();
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutOption.click();
  }

  async getLoggedInUsername(): Promise<string> {
    return (await this.userDropdownName.innerText()).trim();
  }
}
