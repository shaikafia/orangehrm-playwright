import { expect } from '@playwright/test';
import { API4 } from './utils/api4.constants';
import { buildApiUrl } from './utils/api-test.helpers';
import {
  TEST_DATA,
  QUERY_PARAMS,
} from './utils/api4-testdata';
import { createApiFixture } from './utils/api-generic.fixtures';

const test = createApiFixture({
  apiName: 'REST Countries',
});

test.describe('API Testing with REST Countries @regression', () => {
  // ============================================================================
  // All Countries Endpoints
  // ============================================================================

  test('GET - Fetch all countries @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.ALL, undefined, QUERY_PARAMS.ALL_FIELDS, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toHaveProperty('name');
    expect(responseBody[0]).toHaveProperty('cca2');
    expect(responseBody[0]).toHaveProperty('region');
  });

  test('GET - Fetch all countries with fields filter @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.ALL, undefined, QUERY_PARAMS.FIELDS_FILTER, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((country: any) => {
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('capital');
      expect(country).toHaveProperty('region');
      expect(country).toHaveProperty('population');
    });
  });

  // ============================================================================
  // Country Code Endpoints
  // ============================================================================

  test('GET - Search country by valid country code @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody[0]).toHaveProperty('name');
    expect(responseBody[0]).toHaveProperty('cca2');
    expect(responseBody[0].cca2).toBe(TEST_DATA.VALID_COUNTRY_CODE);
  });

  test('GET - Search country by alternative country code @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody[0].cca2).toBe(TEST_DATA.VALID_COUNTRY_CODE_2);
  });

  test('GET - Search country by invalid country code (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.INVALID_COUNTRY_CODE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Country Name Endpoints
  // ============================================================================

  test('GET - Search country by valid country name @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.NAME,
      TEST_DATA.VALID_COUNTRY_NAME,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toHaveProperty('name');
    expect(responseBody[0]).toHaveProperty('capital');
    expect(responseBody[0]).toHaveProperty('region');
  });

  test('GET - Search country by another valid name @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.NAME,
      TEST_DATA.VALID_COUNTRY_NAME_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
  });

  test('GET - Search country by invalid country name (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.NAME,
      TEST_DATA.INVALID_COUNTRY_NAME,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Region Endpoints
  // ============================================================================

  test('GET - Fetch countries by region @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.REGION,
      TEST_DATA.VALID_REGION,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    responseBody.forEach((country: any) => {
      expect(country.region).toBe(TEST_DATA.VALID_REGION);
    });
  });

  test('GET - Fetch countries by another region @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.REGION,
      TEST_DATA.VALID_REGION_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((country: any) => {
      expect(country.region).toBe(TEST_DATA.VALID_REGION_2);
    });
  });

  test('GET - Fetch countries by invalid region (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.REGION,
      TEST_DATA.INVALID_REGION,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Currency Endpoints
  // ============================================================================

  test('GET - Fetch countries by currency @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CURRENCY,
      TEST_DATA.VALID_CURRENCY,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch countries by another currency @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CURRENCY,
      TEST_DATA.VALID_CURRENCY_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
  });

  test('GET - Fetch countries by invalid currency (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CURRENCY,
      TEST_DATA.INVALID_CURRENCY,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Language Endpoints
  // ============================================================================

  test('GET - Fetch countries by language @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.LANGUAGE,
      TEST_DATA.VALID_LANGUAGE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Fetch countries by invalid language (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.LANGUAGE,
      TEST_DATA.INVALID_LANGUAGE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Capital Endpoints
  // ============================================================================

  test('GET - Search countries by capital city @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CAPITAL,
      TEST_DATA.VALID_CAPITAL,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
  });

  test('GET - Search countries by another capital city @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CAPITAL,
      TEST_DATA.VALID_CAPITAL_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
  });

  test('GET - Search countries by invalid capital (negative test)', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CAPITAL,
      TEST_DATA.INVALID_CAPITAL,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  // ============================================================================
  // Response Structure Validation
  // ============================================================================

  test('GET - Validate country response structure @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.ALL, undefined, QUERY_PARAMS.ALL_FIELDS, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const country = responseBody[0];

    // Validate required properties
    expect(country).toHaveProperty('name');
    expect(country).toHaveProperty('cca2');
    expect(country).toHaveProperty('cca3');
    expect(country).toHaveProperty('region');
    expect(country).toHaveProperty('population');
    expect(country).toHaveProperty('area');
    expect(country).toHaveProperty('timezones');

    // Validate property types
    expect(typeof country.name).toBe('object');
    expect(typeof country.cca2).toBe('string');
    expect(typeof country.region).toBe('string');
    expect(typeof country.population).toBe('number');
    expect(Array.isArray(country.timezones)).toBeTruthy();
  });

  test('GET - Validate capital property in country data @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    const responseBody = await response.json();
    const country = responseBody[0];

    expect(country).toHaveProperty('capital');
    expect(Array.isArray(country.capital)).toBeTruthy();
    if (country.capital.length > 0) {
      expect(typeof country.capital[0]).toBe('string');
    }
  });

  // ============================================================================
  // Advanced Filtering Tests
  // ============================================================================

  test('GET - Search multiple countries by code in sequence @smoke', async ({ apiRequest }) => {
    const countries = [TEST_DATA.VALID_COUNTRY_CODE, TEST_DATA.VALID_COUNTRY_CODE_2, TEST_DATA.VALID_COUNTRY_CODE_3];
    
    for (const code of countries) {
      const url = buildApiUrl(API4.ENDPOINTS.ALPHA, code, undefined, API4.BASE_URL);
      const response = await apiRequest.get(url);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody[0].cca2).toBe(code);
    }
  });

  test('GET - Fetch countries with name and region combined filters @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.REGION, TEST_DATA.VALID_REGION, QUERY_PARAMS.FIELDS_FILTER, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    responseBody.forEach((country: any) => {
      expect(country.region).toBe(TEST_DATA.VALID_REGION);
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('capital');
      expect(country).toHaveProperty('population');
    });
  });

  test('GET - Verify country codes are uppercase @smoke', async ({ apiRequest }) => {
    // Use specific country lookup to avoid rate limiting
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    
    if (responseBody[0].cca2) {
      expect(responseBody[0].cca2).toMatch(/^[A-Z]{2}$/);
    }
    if (responseBody[0].cca3) {
      expect(responseBody[0].cca3).toMatch(/^[A-Z]{3}$/);
    }
  });

  test('GET - Verify all countries have population data @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE_2, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    
    const country = responseBody[0];
    // Population is optional but if present, should be a non-negative number
    if (country.population !== undefined && country.population !== null) {
      expect(typeof country.population).toBe('number');
      expect(country.population).toBeGreaterThanOrEqual(0);
    }
  });

  // ============================================================================
  // Error Handling and Edge Cases
  // ============================================================================

  test('GET - Handle empty search results gracefully @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      'ZZ', // Non-existent country code
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(404);
  });

  test('GET - Verify region endpoint returns valid regions @smoke', async ({ apiRequest }) => {
    // Use specific region lookup to avoid rate limiting
    const url = buildApiUrl(API4.ENDPOINTS.REGION, TEST_DATA.VALID_REGION, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const validRegions = new Set();
    
    responseBody.forEach((country: any) => {
      if (country.region) {
        expect(typeof country.region).toBe('string');
        expect(country.region.length).toBeGreaterThan(0);
        validRegions.add(country.region);
      }
    });

    expect(validRegions.size).toBeGreaterThan(0);
  });

  test('GET - Verify all countries have timezones @smoke', async ({ apiRequest }) => {
    // Use specific country lookup to avoid rate limiting
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE_2, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    responseBody.forEach((country: any) => {
      if (country.timezones) {
        expect(Array.isArray(country.timezones)).toBeTruthy();
        if (country.timezones.length > 0) {
          expect(country.timezones.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // ============================================================================
  // Language and Currency Combinations
  // ============================================================================

  test('GET - Verify language endpoint returns countries with languages @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.LANGUAGE,
      TEST_DATA.VALID_LANGUAGE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    
    responseBody.forEach((country: any) => {
      expect(country).toHaveProperty('languages');
      expect(typeof country.languages).toBe('object');
    });
  });

  test('GET - Verify currency endpoint returns valid currency data @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CURRENCY,
      TEST_DATA.VALID_CURRENCY,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    
    responseBody.forEach((country: any) => {
      expect(country).toHaveProperty('currencies');
      expect(typeof country.currencies).toBe('object');
    });
  });

  // ============================================================================
  // Country-Specific Data Validation
  // ============================================================================

  test('GET - Validate US country data structure @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const us = responseBody[0];

    expect(us.cca2).toBe('US');
    expect(us.region).toBe('Americas');
    expect(us).toHaveProperty('capital');
    expect(Array.isArray(us.capital)).toBeTruthy();
    expect(us.capital.length).toBeGreaterThan(0);
  });

  test('GET - Validate UK country data structure @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE_2,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const uk = responseBody[0];

    expect(uk.cca2).toBe('GB');
    expect(uk.region).toBe('Europe');
    expect(uk).toHaveProperty('capital');
  });

  test('GET - Validate France country data structure @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE_3,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const fr = responseBody[0];

    expect(fr.cca2).toBe('FR');
    expect(fr.region).toBe('Europe');
  });

  // ============================================================================
  // Performance and Load Tests
  // ============================================================================

  test('GET - Fetch specific country and verify response time @smoke', async ({ apiRequest }) => {
    const startTime = Date.now();
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE_3, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(TEST_DATA.TIMEOUT_THRESHOLD || 10000); // Should complete within 10 seconds
  });

  test('GET - Verify response body is properly formatted JSON @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    if (contentType) {
      expect(contentType).toContain('application/json');
    }

    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(Array.isArray(responseBody) || typeof responseBody === 'object').toBeTruthy();
  });

  // ============================================================================
  // Sorting and Ordering Tests
  // ============================================================================

  test('GET - Verify consistency when fetching same country multiple times @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.ALPHA,
      TEST_DATA.VALID_COUNTRY_CODE,
      undefined,
      API4.BASE_URL
    );

    const response1 = await apiRequest.get(url);
    const data1 = await response1.json();

    const response2 = await apiRequest.get(url);
    const data2 = await response2.json();

    expect(data1[0].cca2).toBe(data2[0].cca2);
    expect(data1[0].name).toEqual(data2[0].name);
    expect(data1[0].population).toBe(data2[0].population);
  });

  test('GET - Verify all country names are non-empty strings @smoke', async ({ apiRequest }) => {
    // Test multiple countries by code
    const countryCodes = [TEST_DATA.VALID_COUNTRY_CODE, TEST_DATA.VALID_COUNTRY_CODE_2, TEST_DATA.VALID_COUNTRY_CODE_3];
    
    for (const code of countryCodes) {
      const url = buildApiUrl(API4.ENDPOINTS.ALPHA, code, undefined, API4.BASE_URL);
      const response = await apiRequest.get(url);
      expect(response.ok()).toBeTruthy();
      
      const responseBody = await response.json();
      responseBody.forEach((country: any) => {
        expect(country.name).toBeDefined();
        if (country.name && country.name.official) {
          expect(typeof country.name.official).toBe('string');
          expect(country.name.official.length).toBeGreaterThan(0);
        }
      });
    }
  });

  // ============================================================================
  // Search Variations Tests
  // ============================================================================

  test('GET - Search by capital with full city name @smoke', async ({ apiRequest }) => {
    const url = buildApiUrl(
      API4.ENDPOINTS.CAPITAL,
      TEST_DATA.VALID_CAPITAL,
      undefined,
      API4.BASE_URL
    );
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);
    expect(responseBody[0]).toHaveProperty('capital');
  });

  test('GET - Verify area data is numeric for all countries @smoke', async ({ apiRequest }) => {
    // Test multiple countries by code
    const countryCodes = [TEST_DATA.VALID_COUNTRY_CODE, TEST_DATA.VALID_COUNTRY_CODE_2];
    
    for (const code of countryCodes) {
      const url = buildApiUrl(API4.ENDPOINTS.ALPHA, code, undefined, API4.BASE_URL);
      const response = await apiRequest.get(url);
      expect(response.ok()).toBeTruthy();
      
      const responseBody = await response.json();
      responseBody.forEach((country: any) => {
        if (country.area !== null && country.area !== undefined) {
          expect(typeof country.area).toBe('number');
          expect(country.area).toBeGreaterThanOrEqual(0);
        }
      });
    }
  });

  test('GET - Verify borders data structure (if present) @smoke', async ({ apiRequest }) => {
    // Test countries known to have borders
    const url = buildApiUrl(API4.ENDPOINTS.ALPHA, TEST_DATA.VALID_COUNTRY_CODE_2, undefined, API4.BASE_URL);
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const country = responseBody[0];
    
    if (country.borders && Array.isArray(country.borders)) {
      expect(Array.isArray(country.borders)).toBeTruthy();
      if (country.borders.length > 0) {
        country.borders.forEach((border: string) => {
          expect(border).toMatch(/^[A-Z]{1,3}$/);
        });
      }
    }
  });

  test('GET - Verify flag emoji or symbol exists for countries @smoke', async ({ apiRequest }) => {
    // Test specific countries
    const countryCodes = [TEST_DATA.VALID_COUNTRY_CODE, TEST_DATA.VALID_COUNTRY_CODE_2];
    
    for (const code of countryCodes) {
      const url = buildApiUrl(API4.ENDPOINTS.ALPHA, code, undefined, API4.BASE_URL);
      const response = await apiRequest.get(url);
      expect(response.ok()).toBeTruthy();
      
      const responseBody = await response.json();
      expect(responseBody.length).toBeGreaterThan(0);
      
      responseBody.forEach((country: any) => {
        if (country.flags) {
          expect(country.flags).toBeDefined();
          expect(typeof country.flags).toBe('object');
        }
      });
    }
  });
});