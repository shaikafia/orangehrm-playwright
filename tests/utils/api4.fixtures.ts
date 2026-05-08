import { test as base, APIRequestContext } from '@playwright/test';
import { DUMMYJSON_JWT } from './api4.constants';
import { createLoginPayload } from './api4-testdata';

// ── Shape our fixture exposes to tests ────────────────────────────────────────
interface DummyJwtApiRequest {
  get: (url: string) => Promise<any>;
  post: (url: string, data?: any) => Promise<any>;
  put: (url: string, data?: any) => Promise<any>;
  patch: (url: string, data?: any) => Promise<any>;
  delete: (url: string) => Promise<any>;
  // Token accessors — let tests assert on token values directly
  getToken: () => string;
  getRefreshToken: () => string;
  getUserId: () => number;
  getUsername: () => string;
}

export const test = base.extend<{ dummyJwtRequest: DummyJwtApiRequest }>({
  dummyJwtRequest: async ({ request }: { request: APIRequestContext }, use) => {
    // ── STEP 1: POST /auth/login to obtain the JWT ────────────────────────────
    // This is the core difference vs OrangeHRM.
    // We do the login right here with a plain HTTP POST — no browser needed.
    let token = '';
    let refreshToken = '';
    let userId = 0;
    let username = '';

    const loginUrl = `${DUMMYJSON_JWT.BASE_URL}${DUMMYJSON_JWT.ENDPOINTS.LOGIN}`;

    try {
      const loginResponse = await request.post(loginUrl, {
        data: createLoginPayload(),
        headers: { 'Content-Type': 'application/json' },
      });

      if (loginResponse.ok()) {
        const body = await loginResponse.json();

        // Store everything from the login response
        token = body.accessToken || body.token || '';
        refreshToken = body.refreshToken || '';
        userId = body.id || 0;
        username = body.username || '';

        // Log only first 20 chars of token — confirms it loaded
        // without printing the full secret in CI logs
        console.log(`✓ DummyJSON JWT login successful — user: ${username} (id: ${userId})`);
        console.log(`✓ Token preview: ${token.substring(0, 20)}...`);
        console.log(`✓ Token parts: ${token.split('.').length} (3 = valid JWT)`);
      } else {
        const errorBody = await loginResponse.text();
        console.warn(
          `⚠️ DummyJSON JWT login failed — Status: ${loginResponse.status()} — Body: ${errorBody.substring(0, 100)}`
        );
      }
    } catch (error) {
      console.warn(
        '⚠️ DummyJSON JWT fixture error during login:',
        error instanceof Error ? error.message : String(error)
      );
    }

    // ── STEP 2: Build auth headers ────────────────────────────────────────────
    // JWT pattern: Authorization: Bearer <token>
    // Spread operator adds the header only when we actually have a token.
    // If login failed, token is '' (falsy) so no Authorization header is added —
    // tests will receive 401 responses, not silent wrong behaviour.
    const authHeaders = () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    // ── STEP 3: Error logger ──────────────────────────────────────────────────
    // Same pattern as api.fixtures.ts — logs method, URL, status, body on failure.
    // substring(0, 200) prevents large error bodies from flooding the console.
    const logOnError = async (method: string, url: string, response: any) => {
      if (!response.ok()) {
        const body = await response.text();
        console.log(
          `[${method}] ${url}\n  Status: ${response.status()}\n  Body: ${body.substring(0, 200)}`
        );
      }
      return response;
    };

    // ── STEP 4: Five HTTP methods + token accessors ───────────────────────────
    // Every method: attach auth headers → make request → log if error → return response.
    // Tests call dummyJwtRequest.get(url) — identical pattern to apiRequest.get(url).
    const dummyJwtRequest: DummyJwtApiRequest = {
      get: async (url: string) => {
        const response = await request.get(url, { headers: authHeaders() });
        return logOnError('GET', url, response);
      },

      post: async (url: string, data?: any) => {
        const response = await request.post(url, { data, headers: authHeaders() });
        return logOnError('POST', url, response);
      },

      put: async (url: string, data?: any) => {
        const response = await request.put(url, { data, headers: authHeaders() });
        return logOnError('PUT', url, response);
      },

      patch: async (url: string, data?: any) => {
        const response = await request.patch(url, { data, headers: authHeaders() });
        return logOnError('PATCH', url, response);
      },

      delete: async (url: string) => {
        const response = await request.delete(url, { headers: authHeaders() });
        return logOnError('DELETE', url, response);
      },

      // Token accessors — exposed so tests in Groups 3 & 4 can assert on raw values
      getToken: () => token,
      getRefreshToken: () => refreshToken,
      getUserId: () => userId,
      getUsername: () => username,
    };

    // ── STEP 5: Hand fixture to the test ─────────────────────────────────────
    // Everything before use() = setup. Everything after = teardown.
    // JWT is stateless — no logout needed, no file to clean up.
    await use(dummyJwtRequest);
  },
});
