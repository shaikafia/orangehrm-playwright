/**
 * Generic API Test Fixtures Factory
 * Provides a configurable fixture for API testing with optional authentication and rate limiting
 */

import { test as base } from '@playwright/test';

export interface ApiFixtureConfig {
  apiKeyEnvVar?: string;
  customHeaders?: Record<string, string>;
  minRequestInterval?: number;
  apiName?: string;
  enableErrorLogging?: boolean;
  enableRateLimiting?: boolean;
}

export interface ApiRequestFixture {
  apiRequest: {
    get:    (url: string)              => Promise<any>;
    post:   (url: string, data: any)   => Promise<any>;
    put:    (url: string, data: any)   => Promise<any>;
    patch:  (url: string, data: any)   => Promise<any>;
    delete: (url: string)              => Promise<any>;
    fetch:  (url: string, options?: any) => Promise<any>;
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a generic API test fixture with configurable options
 * @param config Configuration for the API fixture
 * @returns Extended test fixture with apiRequest fixture
 */
export function createApiFixture(config: ApiFixtureConfig = {}) {
  const {
    apiKeyEnvVar,
    customHeaders = { 'Content-Type': 'application/json' },
    minRequestInterval = 0,
    apiName = 'API',
    enableErrorLogging = true,
    enableRateLimiting = false,
  } = config;

  return base.extend<ApiRequestFixture>({
    apiRequest: async ({ request }, use) => {
      let lastRequestTime = 0;

      const shouldApplyRateLimit = enableRateLimiting && minRequestInterval > 0;
      console.log(`✓ ${apiName} API Fixture - Rate Limiting: ${shouldApplyRateLimit ? 'Enabled' : 'Disabled'} (min interval: ${minRequestInterval}ms)`);

      const ensureMinInterval = async () => {
        if (!shouldApplyRateLimit) return;
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < minRequestInterval) {
          await delay(minRequestInterval - timeSinceLastRequest);
        }
        lastRequestTime = Date.now();
      };

      const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : null;

      if (apiKeyEnvVar) {
        if (!apiKey) {
          console.warn(`⚠️ ${apiKeyEnvVar} is not set in environment variables`);
        } else {
          console.log(`✓ ${apiName} API key loaded (${apiKey.substring(0, 10)}...)`);
        }
      } else {
        console.log(`✓ ${apiName} API - No authentication required`);
      }

      const headers: Record<string, string> = { ...customHeaders };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const logError = (method: string, url: string, status: number, body: string) => {
        if (enableErrorLogging) {
          console.log(
            `[${method}] ${url}\n  Status: ${status}\n  Body: ${body.substring(0, 200)}`
          );
        }
      };

      const apiRequest = {
        get: async (url: string) => {
          await ensureMinInterval();
          const response = await request.get(url, { headers });
          if (!response.ok()) {
            const body = await response.text();
            logError('GET', url, response.status(), body);
          }
          return response;
        },

        post: async (url: string, data: any) => {
          await ensureMinInterval();
          const response = await request.post(url, { data, headers });
          if (!response.ok()) {
            const body = await response.text();
            logError('POST', url, response.status(), body);
          }
          return response;
        },

        put: async (url: string, data: any) => {
          await ensureMinInterval();
          const response = await request.put(url, { data, headers });
          if (!response.ok()) {
            const body = await response.text();
            logError('PUT', url, response.status(), body);
          }
          return response;
        },

        patch: async (url: string, data: any) => {
          await ensureMinInterval();
          const response = await request.patch(url, { data, headers });
          if (!response.ok()) {
            const body = await response.text();
            logError('PATCH', url, response.status(), body);
          }
          return response;
        },

        delete: async (url: string) => {
          await ensureMinInterval();
          const response = await request.delete(url, { headers });
          if (!response.ok()) {
            const body = await response.text();
            logError('DELETE', url, response.status(), body);
          }
          return response;
        },

        fetch: async (url: string, options?: any) => {
          await ensureMinInterval();
          const response = await request.fetch(url, {
            ...options,
            headers: {
              ...headers,
              ...options?.headers,
            },
          });
          const method = options?.method || 'GET';
          if (!response.ok()) {
            const body = await response.text();
            logError(method, url, response.status(), body);
          }
          return response;
        },
      };

      await use(apiRequest);
    },
  });
}