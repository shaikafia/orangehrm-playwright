/**
 * API Test Fixtures
 * Contains Playwright fixtures for OrangeHRM API test setup.
 * Uses session cookies from global auth setup for authenticated API requests.
 * Falls back to direct login if cookies are unavailable.
 */

import { test as base, APIRequestContext } from '@playwright/test';
import { API } from './api.constants';
import { TEST_ADMIN_CREDENTIALS } from './api-test.data';
import fs from 'fs';
import path from 'path';

/** Delay utility to add wait time between requests and prevent rate limiting */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Minimal response wrapper type */
interface ApiResponse {
  ok: () => boolean;
  status: () => number;
  json: () => Promise<any>;
  text: () => Promise<string>;
  headers: () => Record<string, string>;
}

/**
 * Extended test fixture with a pre-authenticated apiRequest context.
 * Uses stored session cookies from global setup for API authentication.
 * The OrangeHRM API login endpoint (/auth/login) is not publicly available on the demo server,
 * so we use session-based authentication via cookies instead.
 */
export const test = base.extend<{ apiRequest: any }, { request: APIRequestContext }>({
  apiRequest: async (
    { request }: { request: APIRequestContext },
    use: (fixture: any) => Promise<void>
  ) => {
    // ── 1. Load stored auth cookies from global setup ──────────────────────
    let authCookies = [];
    const authFilePath = path.resolve(__dirname, '../../.auth/user.json');

    try {
      if (fs.existsSync(authFilePath)) {
        const authState = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
        authCookies = authState.cookies || [];
        console.log(`✓ Loaded ${authCookies.length} session cookie(s) from global setup`);
      } else {
        console.warn(
          '⚠️ Auth file not found at ' + authFilePath + ' — API requests may be unauthenticated'
        );
      }
    } catch (error) {
      console.warn(
        '⚠️ Failed to load auth cookies:',
        error instanceof Error ? error.message : String(error)
      );
    }

    // ── 2. Build cookie header from loaded cookies ────────────────────────
    const cookieHeader = authCookies
      .map((cookie: any) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    if (cookieHeader) {
      console.log(`✓ Will use session cookie for API requests`);
    } else {
      console.warn('⚠️ No session cookies available — API requests will be unauthenticated');
    }

    // ── 3. Rate-limiting guard ───────────────────────────────────────────────
    let lastRequestTime = 0;
    const MIN_REQUEST_INTERVAL = 300; // ms between requests

    const ensureMinInterval = async () => {
      const now = Date.now();
      const elapsed = now - lastRequestTime;
      if (elapsed < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - elapsed);
      }
      lastRequestTime = Date.now();
    };

    /**
     * Build headers with session cookies instead of Bearer token
     * (The OrangeHRM demo server doesn't expose /auth/login API endpoint,
     *  so we use session-based authentication via cookies)
     */
    const authHeaders = () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add cookies if available
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }

      return headers;
    };

    const logOnError = async (method: string, url: string, response: any) => {
      if (!response.ok()) {
        const body = await response.text();
        console.log(
          `[${method}] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`
        );
      }
      return response;
    };

    // ── 4. Wrapped apiRequest object ─────────────────────────────────────────
    const apiRequest = {
      get: async (url: string) => {
        await ensureMinInterval();
        const response = await request.get(url, { headers: authHeaders() });
        return logOnError('GET', url, response);
      },
      post: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.post(url, { data, headers: authHeaders() });
        return logOnError('POST', url, response);
      },
      put: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.put(url, { data, headers: authHeaders() });
        return logOnError('PUT', url, response);
      },
      patch: async (url: string, data: any) => {
        await ensureMinInterval();
        const response = await request.patch(url, { data, headers: authHeaders() });
        return logOnError('PATCH', url, response);
      },
      delete: async (url: string) => {
        await ensureMinInterval();
        const response = await request.delete(url, { headers: authHeaders() });
        return logOnError('DELETE', url, response);
      },
    };

    await use(apiRequest);
  },
});

export { expect } from '@playwright/test';
