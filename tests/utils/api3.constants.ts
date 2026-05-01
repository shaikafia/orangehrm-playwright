/**
 * API Configuration Constants for Open Meteo Weather API
 * Contains base URL, endpoints, and timeout configurations
 * No authentication required - this is a free public API for testing
 */

export const API4 = {
  BASE_URL: 'https://api.open-meteo.com/v1',
  ENDPOINTS: {
    FORECAST: '/forecast',
    HISTORICAL: '/archive',
    CLIMATE: '/climate',
    ELEVATION: '/elevation',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
  },
};
