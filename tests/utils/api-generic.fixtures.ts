/**
 * Generic API Fixture Factory
 * Creates a reusable API request context for public APIs.
 */

import { test as base } from '@playwright/test';

interface ApiFixtureOptions {
  apiName: string;
  extraHeaders?: Record<string, string>;
}

interface ApiRequestContext {
  get: (url: string) => Promise<any>;
}

export const createApiFixture = (options: ApiFixtureOptions) => {
  return base.extend<{ apiRequest: ApiRequestContext }>({
    apiRequest: async ({ request }, use) => {
      const defaultHeaders = {
        Accept: 'application/json',
        'User-Agent': 'PlaywrightTest/1.0',
        ...(options.extraHeaders ?? {}),
      };

      const apiRequest: ApiRequestContext = {
        get: async (url: string) => {
          return request.get(url, { headers: defaultHeaders });
        },
      };

      await use(apiRequest);
    },
  });
};
