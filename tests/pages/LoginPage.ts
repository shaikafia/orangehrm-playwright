import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.oxd-alert-content-text');
  }

  async goto() {
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  // async goto() {
  //   await this.page.goto('/web/index.php/auth/login');
  //   await this.isLoaded();
  // }

  async isLoaded() {
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
