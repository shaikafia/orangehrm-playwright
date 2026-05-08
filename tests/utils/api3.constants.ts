/**
 * API Configuration Constants for REST Countries
 * Contains base URL, endpoints, and timeout configurations for the REST Countries API
 * No authentication required - this is a free public API for testing
 */

export const API4 = {
  BASE_URL: 'https://restcountries.com/v3.1',
  ENDPOINTS: {
    ALL: '/all',
    NAME: '/name',
    ALPHA: '/alpha',
    CURRENCY: '/currency',
    LANGUAGE: '/lang',
    CAPITAL: '/capital',
    REGION: '/region',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
  },
};