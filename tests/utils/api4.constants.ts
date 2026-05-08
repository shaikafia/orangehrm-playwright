
export const DUMMYJSON_JWT = {
  BASE_URL: 'https://dummyjson.com',

  ENDPOINTS: {
    // ── Auth (the JWT-specific endpoints) ───────────────────────────────────
    LOGIN:   '/auth/login',     
    ME:      '/auth/me',        
    REFRESH: '/auth/refresh',   

    // ── Products ────────────────────────────────────────────────────────────
    PRODUCTS:        '/products',
    PRODUCT_BY_ID:   '/products',       
    PRODUCTS_ADD:    '/products/add',
    PRODUCTS_SEARCH: '/products/search',

    // ── Users ────────────────────────────────────────────────────────────────
    USERS:      '/users',
    USER_BY_ID: '/users',               

    // ── Carts ────────────────────────────────────────────────────────────────
    CARTS:          '/carts',
    CART_BY_ID:     '/carts',
    CARTS_USER:     '/carts/user',      

    // ── Posts ────────────────────────────────────────────────────────────────
    POSTS:       '/posts',
    POST_BY_ID:  '/posts',
    POSTS_SEARCH: '/posts/search',

    // ── Todos ────────────────────────────────────────────────────────────────
    TODOS:          '/todos',
    TODO_BY_ID:     '/todos',
    TODOS_USER:     '/todos/user',      
  },

  TIMEOUTS: {
    RESPONSE_TIME: 5000,    
    LOGIN_TIME:    3000,    
  },
};