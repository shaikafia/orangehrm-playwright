/**
 * API6 — DummyJSON JWT Authentication Tests
 *
 * Why DummyJSON for JWT testing:
 *   - Returns a REAL JWT: three base64url parts separated by dots (header.payload.signature)
 *   - Has /auth/me — a genuinely protected endpoint (401 without token)
 *   - Has refresh token flow — exchange refreshToken for a new access token
 *   - Compare: ReqRes returns an opaque string "QpwL5tpe" — NOT a real JWT
 *
 * Fixture: dummyJwtRequest from api6.fixtures.ts
 *   - Calls POST /auth/login during setup
 *   - Stores token in memory
 *   - Attaches Authorization: Bearer <token> on every request automatically
 *   - Exposes getToken(), getRefreshToken(), getUserId(), getUsername()
 *
 * Test Groups:
 *   Group 1 — JWT Login Flow @critical         (4 tests — 2 positive, 2 negative)
 *   Group 2 — Protected Endpoint /auth/me      (5 tests — 3 positive, 2 negative)
 *   Group 3 — JWT Token Structure Validation   (3 tests — all positive, unique to JWT)
 *   Group 4 — Token Refresh Flow               (2 tests — 1 positive, 1 negative)
 *   Group 5 — Authenticated Products CRUD      (5 tests — 4 positive, 1 negative)
 *   Group 6 — Performance With JWT             (2 tests)
 *   Group 7 — Concurrent Requests With JWT     (1 test)
 *   Group 8 — Error Scenarios                  (3 tests — all negative)
 *                                    Total: 25 tests
 */

import { test } from './utils/api4.fixtures';
import { expect } from '@playwright/test';
import { DUMMYJSON_JWT } from './utils/api4.constants';
import {
  DUMMYJSON_CREDENTIALS,
  DUMMYJSON_IDS,
  DUMMYJSON_PAGINATION,
  createLoginPayload,
  createProductPayload,
} from './utils/api4-testdata';
import { buildApiUrl } from './utils/api-test.helpers';

// ── URL builder shorthand ─────────────────────────────────────────────────────
// Reuses your existing buildApiUrl — passes DUMMYJSON_JWT.BASE_URL as 4th arg
// Same pattern used in api3.spec.ts and api4.spec.ts
const u = (endpoint: string, id?: string | number, query?: string) =>
  buildApiUrl(endpoint, id, query, DUMMYJSON_JWT.BASE_URL);

// ════════════════════════════════════════════════════════════════════════════
// GROUP 1 — JWT Login Flow @critical
// 4 tests — 2 positive, 2 negative
//
// Uses plain { request } — we are testing the login endpoint itself directly.
// dummyJwtRequest already calls login inside the fixture so we do not use it
// here — that would hide what we are actually testing.
// ════════════════════════════════════════════════════════════════════════════
test.describe('JWT Login Flow @critical', () => {
  // POSITIVE — happy path login
  test('POST - Login with valid credentials returns 200 and real 3-part JWT', async ({
    request,
  }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload(),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Token must be present and non-empty
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);

    // THIS is what makes it a real JWT — exactly 3 parts separated by dots
    // header.payload.signature — each part is base64url encoded
    // ReqRes returns "QpwL5tpe83iIkJO" — only 1 part, NOT a real JWT
    // DummyJSON returns "eyJ...eyJ...abc" — 3 parts, a proper JWT
    const parts = body.accessToken.split('.');
    expect(parts.length).toBe(3);
  });

  // POSITIVE — login response contains user info alongside token
  test('POST - Login response contains token refreshToken and user details', async ({
    request,
  }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload(),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();

    // DummyJSON returns both tokens and user info in one response
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('username');
    expect(body).toHaveProperty('email');

    // refreshToken is also a real JWT — not just the access token
    expect(body.refreshToken.split('.').length).toBe(3);

    // Username in the response must match what we sent
    expect(body.username).toBe(DUMMYJSON_CREDENTIALS.VALID_USERNAME);
  });

  // NEGATIVE — wrong password
  test('POST - Login with wrong password returns 400 with error message', async ({ request }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload({ password: DUMMYJSON_CREDENTIALS.WRONG_PASSWORD }),
      headers: { 'Content-Type': 'application/json' },
    });

    // 400 Bad Request — server must reject wrong credentials
    expect(response.status()).toBe(400);

    const body = await response.json();
    // Must return structured JSON error — not blank body or 500
    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');
  });

  // NEGATIVE — invalid username
  test('POST - Login with invalid username returns 400', async ({ request }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload({ username: DUMMYJSON_CREDENTIALS.INVALID_USERNAME }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 2 — Protected Endpoint /auth/me @critical
// 5 tests — 3 positive, 2 negative
//
// /auth/me is the most important group — it ENFORCES authentication.
// This is what proves the JWT is actually working — not just being received.
// Without a valid Bearer token the server returns 401.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Protected Endpoint /auth/me @critical', () => {
  // POSITIVE — valid token, correct user returned
  test('GET - /auth/me with valid Bearer token returns 200 @smoke', async ({ dummyJwtRequest }) => {
    // dummyJwtRequest attaches Authorization: Bearer <token> automatically
    const response = await dummyJwtRequest.get(u(DUMMYJSON_JWT.ENDPOINTS.ME));

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    // Must return the user who logged in
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('username');
    expect(body).toHaveProperty('email');
    expect(body.username).toBe(DUMMYJSON_CREDENTIALS.VALID_USERNAME);
  });

  // POSITIVE — response user ID matches login user ID
  test('GET - /auth/me user ID matches fixture getUserId()', async ({ dummyJwtRequest }) => {
    const response = await dummyJwtRequest.get(u(DUMMYJSON_JWT.ENDPOINTS.ME));
    const body = await response.json();

    // Two sources must agree on the same user ID:
    // 1. /auth/me response body
    // 2. Login response stored inside fixture via getUserId()
    expect(body.id).toBe(dummyJwtRequest.getUserId());
  });

  // POSITIVE — username matches
  test('GET - /auth/me username matches fixture getUsername()', async ({ dummyJwtRequest }) => {
    const response = await dummyJwtRequest.get(u(DUMMYJSON_JWT.ENDPOINTS.ME));
    const body = await response.json();

    expect(body.username).toBe(dummyJwtRequest.getUsername());
  });

  // NEGATIVE — no token at all
  test('GET - /auth/me WITHOUT token returns 401', async ({ request }) => {
    // Using plain { request } — no Bearer header attached
    // This PROVES the endpoint enforces authentication
    const response = await request.get(u(DUMMYJSON_JWT.ENDPOINTS.ME), {
      headers: { 'Content-Type': 'application/json' },
    });

    // 401 Unauthorized — no token, no access
    expect(response.status()).toBe(401);

    const body = await response.json();
    // Error must be structured JSON — not an HTML error page
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE — fake token
  test('GET - /auth/me with fake Bearer token returns 401', async ({ request }) => {
    // Sending a made-up Bearer string — server must reject it
    // Proves the server validates the token signature, not just its presence
    const response = await request.get(u(DUMMYJSON_JWT.ENDPOINTS.ME), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer thisisafaketoken',
      },
    });

    expect(response.status()).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 3 — JWT Token Structure Validation
// 3 tests — all positive, unique to JWT
//
// This is what makes DummyJSON special in this project.
// We can actually DECODE the JWT parts and inspect the contents.
// No other API in this project lets us do this —
// OrangeHRM uses cookies, ReqRes returns an opaque string.
// Buffer.from(part, 'base64url') decodes each part into readable JSON.
// ════════════════════════════════════════════════════════════════════════════
test.describe('JWT Token Structure Validation', () => {
  // Decode header — first part of the JWT
  test('JWT header decodes to object with alg and typ JWT', async ({ dummyJwtRequest }) => {
    const token = dummyJwtRequest.getToken();
    const headerPart = token.split('.')[0]; // first part = header

    // Decode base64url → UTF-8 string → JavaScript object
    const decoded = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf-8'));

    // JWT header must always have these two fields
    expect(decoded).toHaveProperty('alg'); // signing algorithm e.g. "HS256"
    expect(decoded).toHaveProperty('typ'); // token type — must be "JWT"
    expect(decoded.typ).toBe('JWT');
    expect(typeof decoded.alg).toBe('string');
  });

  // Decode payload — second part of the JWT
  test('JWT payload decodes to object with id and iat timestamp', async ({ dummyJwtRequest }) => {
    const token = dummyJwtRequest.getToken();
    const payloadPart = token.split('.')[1]; // second part = payload (claims)

    const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf-8'));

    // Standard JWT claims
    expect(decoded).toHaveProperty('id'); // user identifier
    expect(decoded).toHaveProperty('iat'); // issued-at — Unix timestamp in seconds
    expect(typeof decoded.id).toBe('number');
    expect(typeof decoded.iat).toBe('number');

    // iat must be a recent Unix timestamp — within the last 5 minutes
    const nowSeconds = Math.floor(Date.now() / 1000);
    expect(decoded.iat).toBeLessThanOrEqual(nowSeconds + 120);
    expect(decoded.iat).toBeGreaterThan(nowSeconds - 300);
  });

  // Cross-check decoded payload ID with fixture getUserId()
  test('JWT payload user ID matches fixture getUserId()', async ({ dummyJwtRequest }) => {
    const token = dummyJwtRequest.getToken();
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));

    // Three sources must all agree on the same user ID:
    // 1. JWT payload decoded directly from the token string
    // 2. getUserId() from login response stored in the fixture
    // 3. /auth/me response (tested in Group 2)
    expect(decoded.id).toBe(dummyJwtRequest.getUserId());
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 4 — Token Refresh Flow
// 2 tests — 1 positive, 1 negative
//
// The refresh token is used to get a new access token when the current one
// expires — without making the user log in again.
// DummyJSON's refreshToken is also a real 3-part JWT.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Token Refresh Flow', () => {
  // POSITIVE — valid refresh token returns new access token
  test('POST - Refresh with valid refreshToken returns new 3-part JWT', async ({
    dummyJwtRequest,
    request,
  }) => {
    const refreshToken = dummyJwtRequest.getRefreshToken();

    // The refreshToken from the fixture must also be a valid 3-part JWT
    expect(refreshToken.split('.').length).toBe(3);

    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.REFRESH), {
      data: { refreshToken, expiresInMins: 30 },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    // Both new tokens returned
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    // Both must be valid 3-part JWTs
    expect(body.accessToken.split('.').length).toBe(3);
    expect(body.refreshToken.split('.').length).toBe(3);
  });

  // NEGATIVE — invalid refresh token
  test('POST - Refresh with invalid refreshToken returns 401', async ({ request }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.REFRESH), {
      data: { refreshToken: 'totallyinvalidtoken', expiresInMins: 30 },
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 403]).toContain(response.status());
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 5 — Authenticated Products CRUD @smoke
// 5 tests — 4 positive, 1 negative
//
// All five HTTP methods: GET list, POST create, PATCH partial, DELETE, GET 404.
// Every request goes through dummyJwtRequest which attaches Bearer token.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Authenticated Products CRUD @smoke', () => {
  // POSITIVE — GET list with pagination
  test('GET - Products list with Bearer token returns 200 and valid structure', async ({
    dummyJwtRequest,
  }) => {
    const response = await dummyJwtRequest.get(
      u(
        DUMMYJSON_JWT.ENDPOINTS.PRODUCTS,
        undefined,
        `?limit=${DUMMYJSON_PAGINATION.LIMIT}&skip=${DUMMYJSON_PAGINATION.SKIP_PAGE_1}`
      )
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('products');
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);

    // Every product must have correct field types
    body.products.forEach((product: any) => {
      expect(typeof product.id).toBe('number');
      expect(typeof product.title).toBe('string');
      expect(typeof product.price).toBe('number');
      // Business rule — price must always be positive
      expect(product.price).toBeGreaterThan(0);
    });
  });

  // POSITIVE — POST create
  test('POST - Create product with token returns 201 and echoes fields', async ({
    dummyJwtRequest,
  }) => {
    const payload = createProductPayload();
    const response = await dummyJwtRequest.post(u(DUMMYJSON_JWT.ENDPOINTS.PRODUCTS_ADD), payload);

    expect(response.status()).toBe(201);
    const body = await response.json();

    // Response must echo back what we sent
    expect(body.title).toBe(payload.title);
    expect(body.price).toBe(payload.price);
    // Server assigns a new ID
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('number');
  });

  // POSITIVE — PATCH partial update (only price changed)
  test('PATCH - Partial update product price only returns 200', async ({ dummyJwtRequest }) => {
    const response = await dummyJwtRequest.patch(
      u(DUMMYJSON_JWT.ENDPOINTS.PRODUCT_BY_ID, DUMMYJSON_IDS.VALID_PRODUCT),
      { price: 999.99 } // PATCH — only send what needs to change
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.price).toBe(999.99);
    expect(body).toHaveProperty('id');
  });

  // POSITIVE — DELETE
  test('DELETE - Delete product returns 200 with isDeleted true', async ({ dummyJwtRequest }) => {
    const response = await dummyJwtRequest.delete(
      u(DUMMYJSON_JWT.ENDPOINTS.PRODUCT_BY_ID, DUMMYJSON_IDS.VALID_PRODUCT_2)
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // DummyJSON echoes the deleted product back with these two fields
    expect(body).toHaveProperty('isDeleted');
    expect(body.isDeleted).toBe(true);
    expect(body).toHaveProperty('deletedOn');
  });

  // NEGATIVE — non-existent product ID
  test('GET - Non-existent product ID 9999 returns 404 with message', async ({
    dummyJwtRequest,
  }) => {
    const response = await dummyJwtRequest.get(
      u(DUMMYJSON_JWT.ENDPOINTS.PRODUCT_BY_ID, DUMMYJSON_IDS.INVALID_PRODUCT)
    );

    expect(response.status()).toBe(404);
    const body = await response.json();
    // Server must return structured JSON error — not blank body
    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 6 — Performance With JWT
// 2 tests
//
// Date.now() before and after — elapsed must be under 5000ms.
// Same pattern as api.spec.ts Group 8.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Performance With JWT', () => {
  test('POST - Login responds within 5000ms', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload(),
      headers: { 'Content-Type': 'application/json' },
    });
    const elapsed = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(DUMMYJSON_JWT.TIMEOUTS.RESPONSE_TIME);
  });

  test('GET - /auth/me with token responds within 5000ms', async ({ dummyJwtRequest }) => {
    const start = Date.now();
    const response = await dummyJwtRequest.get(u(DUMMYJSON_JWT.ENDPOINTS.ME));
    const elapsed = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(DUMMYJSON_JWT.TIMEOUTS.RESPONSE_TIME);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 7 — Concurrent Requests With JWT
// 1 test
//
// Fires three requests simultaneously using Promise.all.
// Same pattern as api.spec.ts Group 9.
// Proves the Bearer token works under concurrent load.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Concurrent Requests With JWT', () => {
  test('GET - Three simultaneous requests all return 200 with same token', async ({
    dummyJwtRequest,
  }) => {
    const productUrl = u(DUMMYJSON_JWT.ENDPOINTS.PRODUCTS);

    // Array(3).fill(null).map creates 3 pending promises without awaiting
    // Promise.all fires all three simultaneously — not one by one
    const responses = await Promise.all(
      Array(3)
        .fill(null)
        .map(() => dummyJwtRequest.get(productUrl))
    );

    // All three must succeed with the same Bearer token
    responses.forEach((response) => {
      expect(response.status()).toBe(200);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// GROUP 8 — Error Scenarios
// 3 tests — all negative
//
// Every negative test checks:
//   1. The correct HTTP status code
//   2. The response body has a structured 'message' field
// This proves the server handles all failures gracefully — never returns
// a blank body or an HTML crash page.
// ════════════════════════════════════════════════════════════════════════════
test.describe('Error Scenarios', () => {
  // NEGATIVE — wrong credentials
  test('POST - Login with wrong credentials returns 400 and message field', async ({ request }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.LOGIN), {
      data: createLoginPayload({
        username: DUMMYJSON_CREDENTIALS.VALID_USERNAME,
        password: DUMMYJSON_CREDENTIALS.WRONG_PASSWORD,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  // NEGATIVE — no token on protected endpoint
  test('GET - /auth/me without token returns 401 and message field', async ({ request }) => {
    const response = await request.get(u(DUMMYJSON_JWT.ENDPOINTS.ME), {
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE — invalid refresh token
  test('POST - Refresh with invalid token returns 401 and message field', async ({ request }) => {
    const response = await request.post(u(DUMMYJSON_JWT.ENDPOINTS.REFRESH), {
      data: { refreshToken: 'invalidtoken', expiresInMins: 30 },
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 403]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });
});
