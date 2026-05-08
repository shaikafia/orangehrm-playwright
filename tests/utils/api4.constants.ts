/**
 * API6 Configuration Constants — DummyJSON JWT Authentication
 *
 * DummyJSON is the only free public API in this project that returns
 * a REAL JWT token — three base64url parts separated by dots:
 *   header.payload.signature
 *
 * Authentication flow:
 *   POST /auth/login  →  { token, refreshToken, id, username, ... }
 *   GET  /auth/me     →  protected endpoint, requires Bearer token
 *   POST /auth/refresh →  exchange refreshToken for a new access token
 *
 * Compare with OrangeHRM (api.fixtures.ts):
 *   OrangeHRM → session cookies (no REST login endpoint on demo)
 *   DummyJSON → JWT Bearer token (POST login → get token → attach header)
 */

export const DUMMYJSON_JWT = {
  BASE_URL: 'https://dummyjson.com',

  ENDPOINTS: {
    // ── Auth (the JWT-specific endpoints) ───────────────────────────────────
    LOGIN:   '/auth/login',     // POST — returns token + refreshToken (real JWTs)
    ME:      '/auth/me',        // GET  — ONLY works with valid Bearer token → 401 without it
    REFRESH: '/auth/refresh',   // POST — exchange refreshToken for new access token

    // ── Products ────────────────────────────────────────────────────────────
    PRODUCTS:        '/products',
    PRODUCT_BY_ID:   '/products',       // buildApiUrl appends /{id}
    PRODUCTS_ADD:    '/products/add',
    PRODUCTS_SEARCH: '/products/search',

    // ── Users ────────────────────────────────────────────────────────────────
    USERS:      '/users',
    USER_BY_ID: '/users',               // buildApiUrl appends /{id}

    // ── Carts ────────────────────────────────────────────────────────────────
    CARTS:          '/carts',
    CART_BY_ID:     '/carts',
    CARTS_USER:     '/carts/user',      // GET /carts/user/{userId}

    // ── Posts ────────────────────────────────────────────────────────────────
    POSTS:       '/posts',
    POST_BY_ID:  '/posts',
    POSTS_SEARCH: '/posts/search',

    // ── Todos ────────────────────────────────────────────────────────────────
    TODOS:          '/todos',
    TODO_BY_ID:     '/todos',
    TODOS_USER:     '/todos/user',      // GET /todos/user/{userId}
  },

  TIMEOUTS: {
    RESPONSE_TIME: 5000,    // 5 seconds — max acceptable round-trip
    LOGIN_TIME:    3000,    // 3 seconds — max acceptable login time
  },
};