export const API5 = {
  BASE_URL: 'https://restful-booker.herokuapp.com',
  ENDPOINTS: {
    AUTH: '/auth',
    BOOKING: '/booking',
  },
  CREDENTIALS: {
    username: 'admin',
    password: 'password123',
  },
  INVALID_CREDENTIALS: {          // ✅ moved from spec (comment 1)
    username: 'wronguser',
    password: 'wrongpass',
  },
  ERROR_MESSAGES: {               // ✅ moved from spec (comment 2)
    BAD_CREDENTIALS: 'Bad credentials',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
    PUT_RESPONSE: 3000,
  },
};