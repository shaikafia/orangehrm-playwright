import { Page } from '@playwright/test';

/**
 * Checks whether the current page session is authenticated.
 *
 * OrangeHRM silently redirects any protected URL to /auth/login when the
 * session has expired. This helper detects that situation so that beforeEach
 * blocks can surface a clear, actionable error instead of a confusing
 * "element not found" failure on a locator that only exists on the real page.
 *
 * Usage (in beforeEach):
 *   await assertAuthenticated(page);
 */
export async function assertAuthenticated(page: Page): Promise<void> {
  const currentUrl = page.url();
  if (currentUrl.includes('/auth/login')) {
    throw new Error(
      `Session not authenticated. The page redirected to the login screen.\n` +
      `This usually means the saved auth state in .auth/user.json has expired.\n` +
      `Fix: delete .auth/user.json and re-run the tests so global-setup re-authenticates.`
    );
  }
}
