import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly dashboardHeading: Locator;
  readonly userDropdown: Locator;
  readonly logoutOption: Locator;
  readonly userDropdownName: Locator;

  constructor(private readonly page: Page) {
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutOption = page.getByRole('menuitem', { name: 'Logout' });
    this.userDropdownName = page.locator('.oxd-userdropdown-name');
  }

  async isLoaded() {
    // FIX: .oxd-userdropdown-tab is always rendered visible on all authenticated pages.
    // Replaces brittle locator('.oxd-layout-navigation') which has CSS visibility:hidden
    // due to OrangeHRM's sidebar transition animation.
    await expect(this.userDropdown).toBeVisible({ timeout: 15000 });
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