import { type Page, type Locator, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TIMEOUTS, NAV_LABELS, SELECTORS, PLACEHOLDERS } from '../utils/constants';

function getLoginUrl(): string {
  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', '..', 'config', `testdata.${env}.json`);
  return JSON.parse(fs.readFileSync(testDataPath, 'utf8')).urls.login;
}

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly fieldError: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByPlaceholder(PLACEHOLDERS.username);
    this.passwordInput = page.getByPlaceholder(PLACEHOLDERS.password);
    this.loginButton   = page.getByRole('button', { name: NAV_LABELS.login });
    this.errorMessage  = page.locator(SELECTORS.alertText);
    this.fieldError    = page.locator(SELECTORS.fieldError).first();
  }

  async goto() {
    await this.page.goto(getLoginUrl(), { waitUntil: 'domcontentloaded' });
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