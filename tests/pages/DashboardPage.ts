import { type Page, type Locator, expect } from '@playwright/test';
import { NAV_LABELS, TIMEOUTS, SELECTORS } from '../utils/constants';

export class DashboardPage {
  readonly dashboardHeading: Locator;
  readonly userDropdown: Locator;
  readonly logoutOption: Locator;
  readonly userDropdownName: Locator;

  constructor(private readonly page: Page) {
    this.dashboardHeading = page.getByRole('heading', { name: NAV_LABELS.dashboard });
    this.userDropdown     = page.locator(SELECTORS.userDropdown);
    this.logoutOption     = page.getByRole('menuitem', { name: NAV_LABELS.logout });
    this.userDropdownName = page.locator(SELECTORS.userDropdownName);
  }

  async isLoaded() {
    await expect(this.page.getByRole('link', { name: NAV_LABELS.dashboard })).toBeVisible({ timeout: TIMEOUTS.navigation });
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