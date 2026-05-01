/**
 * API4 Test Data for REST Countries
 * Contains test data, IDs, and sample payloads for API testing
 */

export const TEST_DATA = {
  // Valid country codes
  VALID_COUNTRY_CODE: 'US',
  VALID_COUNTRY_CODE_2: 'GB',
  VALID_COUNTRY_CODE_3: 'FR',
  INVALID_COUNTRY_CODE: 'XX',
  
  // Valid country names
  VALID_COUNTRY_NAME: 'United States',
  VALID_COUNTRY_NAME_2: 'United Kingdom',
  VALID_COUNTRY_NAME_3: 'France',
  INVALID_COUNTRY_NAME: 'NonExistentCountry',
  
  // Valid regions
  VALID_REGION: 'Europe',
  VALID_REGION_2: 'Americas',
  INVALID_REGION: 'NonExistentRegion',
  
  // Valid currencies
  VALID_CURRENCY: 'usd',
  VALID_CURRENCY_2: 'gbp',
  INVALID_CURRENCY: 'xxx',
  
  // Valid languages
  VALID_LANGUAGE: 'eng',
  INVALID_LANGUAGE: 'xyz',
  
  // Valid capitals
  VALID_CAPITAL: 'Washington, D.C.',
  VALID_CAPITAL_2: 'London',
  INVALID_CAPITAL: 'NonExistentCity',
  
  // Performance
  TIMEOUT_THRESHOLD: 10000, // 10 seconds
};

// Query parameters for filtering
export const QUERY_PARAMS = {
  FIELDS_FILTER: '?fields=name,capital,region,population',
  LIMIT: '?limit=10',
  ALL_FIELDS: '?fields=name,cca2,region,cca3,population,area,timezones',
};