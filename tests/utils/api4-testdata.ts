/**
 * API6 Test Data — DummyJSON JWT Authentication
 *
 * DummyJSON only accepts pre-defined usernames from its built-in user list.
 * You cannot register arbitrary accounts — only these seeded users work.
 * Full user list at: https://dummyjson.com/users
 *
 * Factory functions follow the same pattern as api-test.data.ts:
 *   createLoginPayload()                        → default valid credentials
 *   createLoginPayload({ password: 'wrong' })   → override one field, keep rest
 */

// ── Credentials ──────────────────────────────────────────────────────────────
export const DUMMYJSON_CREDENTIALS = {
  // Primary test user — used in all happy-path tests
  VALID_USERNAME:   'emilys',
  VALID_PASSWORD:   'emilyspass',

  // Second valid user — used in multi-user / comparison tests
  VALID_USERNAME_2: 'michaelw',
  VALID_PASSWORD_2: 'michaelwpass',

  // Negative test values
  INVALID_USERNAME: 'notarealuser',
  WRONG_PASSWORD:   'completelyWrongPassword',
};

// ── Resource IDs ──────────────────────────────────────────────────────────────
export const DUMMYJSON_IDS = {
  VALID_PRODUCT:    1,
  VALID_PRODUCT_2:  2,
  INVALID_PRODUCT:  9999,     

  VALID_USER:       1,
  VALID_USER_2:     2,
  INVALID_USER:     9999,

  VALID_CART:       1,
  VALID_POST:       1,
  VALID_TODO:       1,
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const DUMMYJSON_PAGINATION = {
  LIMIT:            5,
  SKIP_PAGE_1:      0,
  SKIP_PAGE_2:      5,    
};

// ── Factory functions ─────────────────────────────────────────────────────────


export const createLoginPayload = (
  overrides?: Partial<{ username: string; password: string; expiresInMins: number }>
) => ({
  username:      DUMMYJSON_CREDENTIALS.VALID_USERNAME,
  password:      DUMMYJSON_CREDENTIALS.VALID_PASSWORD,
  expiresInMins: 30,
  ...overrides,
});

/**
 * New product payload factory.
 * Used in POST /products/add tests.
 */
export const createProductPayload = (
  overrides?: Partial<{
    title:       string;
    price:       number;
    stock:       number;
    category:    string;
    description: string;
  }>
) => ({
  title:       'Playwright Test Product',
  price:       49.99,
  stock:       100,
  category:    'test-category',
  description: 'Created by Playwright API test suite',
  ...overrides,
});

/**
 * Update product payload factory.
 * Used in PUT /products/{id} tests.
 */
export const createUpdateProductPayload = (
  overrides?: Partial<{ title: string; price: number }>
) => ({
  title: 'Updated Playwright Product',
  price: 59.99,
  ...overrides,
});