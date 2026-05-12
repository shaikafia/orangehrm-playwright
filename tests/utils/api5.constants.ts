export const API5 = {
  BASE_URL: 'https://restful-booker.herokuapp.com',
  ENDPOINTS: {
    AUTH:    '/auth',
    BOOKING: '/booking',
  },
  CREDENTIALS: {
    username: 'admin',
    password: 'password123',
  },
  INVALID_CREDENTIALS: {
    username: 'wronguser',
    password: 'wrongpass',
  },
  IDS: {
    VALID_BOOKING:   1,
    INVALID_BOOKING: 9999999,
  },
  INVALID_TOKEN: 'token=thisisaninvalidtoken999',
  HEALTH_CHECK_RESPONSE: 'Created',
  ERROR_MESSAGES: {
    BAD_CREDENTIALS: 'Bad credentials',
  },
  TIMEOUTS: {
    GET_RESPONSE:  5000,
    POST_RESPONSE: 3000,
    PUT_RESPONSE:  3000,
  },
};