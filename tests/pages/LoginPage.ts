import { type Page, type Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../utils/constants';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly fieldError: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.oxd-alert-content-text');
    // Field-level required error (used in TC-05 and TC-06)
    this.fieldError = page.locator('.oxd-input-field-error-message').first();
  }

  async goto() {
    // No URL argument — baseURL is set in playwright.config.ts, page goes to login path
    await this.page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await this.isLoaded();
  }

  async isLoaded() {
    await expect(this.usernameInput).toBeVisible({ timeout: TIMEOUTS.login });
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

  async expectFieldError() {
    await expect(this.fieldError).toBeVisible();
  }
}
