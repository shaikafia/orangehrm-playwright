/**
 * API5 Configuration Constants for Restful Booker API
 * Contains base URL, endpoints, and default credentials for authentication and booking operations.
 */

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
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
    PUT_RESPONSE: 3000,
  },
};
