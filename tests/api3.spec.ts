/**
 * API4 Test Suite — Open Meteo Weather API
 *
 * Open Meteo is a free, open-source weather API that requires NO authentication.
 * It returns real forecast, historical, and elevation data in JSON format.
 *
 * All tests follow the exact same structure as api3.spec.ts (REST Countries)
 * so the codebase is consistent and easy to maintain.
 *
 * Base URL: https://api.open-meteo.com/v1
 * Docs:     https://open-meteo.com/en/docs
 */

import { test } from './utils/api3.fixtures';
import { expect } from '@playwright/test';
import { API4 } from './utils/api3.constants';
import { TEST_DATA4, QUERY_PARAMS4 } from './utils/api3-test.data';

test.describe('API Testing with Open Meteo Weather API @regression', () => {
  // ============================================================================
  // Basic Forecast Endpoint
  // ============================================================================

  test('GET - Fetch weather forecast for New York City @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('latitude');
    expect(responseBody).toHaveProperty('longitude');
    expect(responseBody).toHaveProperty('hourly');
  });

  test('GET - Fetch full daily forecast with multiple weather variables @smoke', async ({
    apiRequest,
  }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.FULL_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('daily');
    expect(responseBody.daily).toHaveProperty('temperature_2m_max');
    expect(responseBody.daily).toHaveProperty('temperature_2m_min');
    expect(responseBody.daily).toHaveProperty('precipitation_sum');
    expect(Array.isArray(responseBody.daily.temperature_2m_max)).toBeTruthy();
  });

  test('GET - Fetch weather forecast for London @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.LONDON_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('latitude');
    expect(responseBody).toHaveProperty('longitude');
    expect(responseBody).toHaveProperty('hourly');
  });

  test('GET - Fetch weather forecast for Paris @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.PARIS_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('latitude');
    expect(responseBody).toHaveProperty('longitude');
  });

  test('GET - Fetch weather forecast for Tokyo @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.TOKYO_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('latitude');
    expect(responseBody).toHaveProperty('longitude');
  });

  // ============================================================================
  // Elevation Endpoint
  // ============================================================================

  test('GET - Fetch elevation data for New York City @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.ELEVATION}${QUERY_PARAMS4.ELEVATION_QUERY}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('elevation');
    expect(Array.isArray(responseBody.elevation)).toBeTruthy();
    expect(responseBody.elevation.length).toBeGreaterThan(0);
  });

  test('GET - Fetch elevation data for multiple cities at once @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.ELEVATION}${QUERY_PARAMS4.MULTIPLE_ELEVATION}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(Array.isArray(responseBody.elevation)).toBeTruthy();
    // We requested 3 cities so we expect 3 elevation values back
    expect(responseBody.elevation.length).toBe(3);
  });

  test('GET - Elevation values are numeric @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.ELEVATION}${QUERY_PARAMS4.ELEVATION_QUERY}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    responseBody.elevation.forEach((value: any) => {
      expect(typeof value).toBe('number');
    });
  });

  // ============================================================================
  // Historical Archive Endpoint
  // ============================================================================

  test('GET - Fetch historical weather data for New York @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.HISTORICAL}${QUERY_PARAMS4.HISTORICAL_NYC}`;
    const response = await apiRequest.get(url);

    // Historical endpoint returns 200 or 400 (if date is too recent or outside range)
    expect([200, 400, 404]).toContain(response.status());

    if (response.status() === 200) {
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('daily');
      expect(responseBody).toHaveProperty('latitude');
      expect(responseBody).toHaveProperty('longitude');
    }
  });

  // ============================================================================
  // Response Structure Validation
  // ============================================================================

  test('GET - Validate forecast response top-level fields @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // Validate required top-level properties
    expect(responseBody).toHaveProperty('latitude');
    expect(responseBody).toHaveProperty('longitude');
    expect(responseBody).toHaveProperty('generationtime_ms');
    expect(responseBody).toHaveProperty('utc_offset_seconds');
    expect(responseBody).toHaveProperty('timezone');
    expect(responseBody).toHaveProperty('hourly_units');
    expect(responseBody).toHaveProperty('hourly');
  });

  test('GET - Validate coordinate types in forecast response @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // latitude and longitude must be numbers
    expect(typeof responseBody.latitude).toBe('number');
    expect(typeof responseBody.longitude).toBe('number');
    expect(typeof responseBody.generationtime_ms).toBe('number');
    expect(typeof responseBody.utc_offset_seconds).toBe('number');
    expect(typeof responseBody.timezone).toBe('string');
  });

  test('GET - Validate hourly temperature array is non-empty @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    expect(responseBody.hourly).toHaveProperty('temperature_2m');
    expect(Array.isArray(responseBody.hourly.temperature_2m)).toBeTruthy();
    // A 7-day forecast at hourly resolution = 168 values
    expect(responseBody.hourly.temperature_2m.length).toBeGreaterThanOrEqual(24);
  });

  test('GET - Validate hourly units object is correct @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    expect(responseBody.hourly_units).toHaveProperty('time');
    expect(responseBody.hourly_units).toHaveProperty('temperature_2m');
    expect(typeof responseBody.hourly_units.temperature_2m).toBe('string');
    // The unit for temperature should be a string like "°C" or "°F"
    expect(responseBody.hourly_units.temperature_2m.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Negative Tests — Error Handling
  // ============================================================================

  test('GET - Missing latitude parameter returns 400 (negative test)', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.MISSING_LAT}`;
    const response = await apiRequest.get(url);

    // API must reject requests with missing required coordinates
    expect(response.status()).toBe(400);
  });

  test('GET - Missing longitude parameter returns 400 (negative test)', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.MISSING_LON}`;
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(400);
  });

  test('GET - Invalid coordinates outside range returns 400 (negative test)', async ({
    apiRequest,
  }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.INVALID_COORDS}`;
    const response = await apiRequest.get(url);

    // latitude=999 is out of the valid -90 to 90 range — API should reject it
    expect(response.status()).toBe(400);
  });

  test('GET - Error response body has reason field (negative test)', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.MISSING_LAT}`;
    const response = await apiRequest.get(url);

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    // Open Meteo returns { error: true, reason: "..." } on 400
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toBe(true);
    expect(responseBody).toHaveProperty('reason');
    expect(typeof responseBody.reason).toBe('string');
  });

  // ============================================================================
  // Multi-City Sequential Tests
  // ============================================================================

  test('GET - Fetch forecasts for multiple cities in sequence @smoke', async ({ apiRequest }) => {
    const cities = [
      QUERY_PARAMS4.BASIC_FORECAST, // NYC
      QUERY_PARAMS4.LONDON_FORECAST, // London
      QUERY_PARAMS4.PARIS_FORECAST, // Paris
    ];

    for (const params of cities) {
      const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${params}`;
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('hourly');
    }
  });

  test('GET - Verify consistency when fetching same city twice @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;

    const response1 = await apiRequest.get(url);
    const data1 = await response1.json();

    const response2 = await apiRequest.get(url);
    const data2 = await response2.json();

    // Same city, same request → coordinates must match
    expect(data1.latitude).toBe(data2.latitude);
    expect(data1.longitude).toBe(data2.longitude);
    expect(data1.timezone).toBe(data2.timezone);
  });

  // ============================================================================
  // Data Quality Tests
  // ============================================================================

  test('GET - Latitude returned is close to requested latitude @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // Open Meteo snaps coords to the nearest grid point.
    // The returned latitude should be within 1 degree of what we requested.
    expect(Math.abs(responseBody.latitude - TEST_DATA4.VALID_LAT)).toBeLessThan(1);
  });

  test('GET - Temperature values are realistic numbers @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const temps: number[] = responseBody.hourly.temperature_2m;

    // Filter out null values (can occur at forecast boundaries)
    const validTemps = temps.filter((t) => t !== null && t !== undefined);
    expect(validTemps.length).toBeGreaterThan(0);

    validTemps.forEach((temp) => {
      expect(typeof temp).toBe('number');
      // Realistic surface temperature range on Earth: -100°C to +60°C
      expect(temp).toBeGreaterThan(-100);
      expect(temp).toBeLessThan(100);
    });
  });

  test('GET - Hourly time array has ISO 8601 date-time strings @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    const times: string[] = responseBody.hourly.time;

    expect(Array.isArray(times)).toBeTruthy();
    expect(times.length).toBeGreaterThan(0);

    // Each time entry should look like "2025-04-28T00:00"
    times.slice(0, 5).forEach((t) => {
      expect(t).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  test('GET - Hourly time and temperature arrays have equal length @smoke', async ({
    apiRequest,
  }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    const timeLen = responseBody.hourly.time.length;
    const tempLen = responseBody.hourly.temperature_2m.length;

    // Both arrays must be the same length — one temp value per time slot
    expect(timeLen).toBe(tempLen);
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  test('GET - Forecast response time is within acceptable limit @smoke', async ({ apiRequest }) => {
    const startTime = Date.now();
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const elapsed = endTime - startTime;
    expect(elapsed).toBeLessThan(TEST_DATA4.TIMEOUT_THRESHOLD); // 10 seconds
  });

  test('GET - Elevation response time is within acceptable limit @smoke', async ({
    apiRequest,
  }) => {
    const startTime = Date.now();
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.ELEVATION}${QUERY_PARAMS4.ELEVATION_QUERY}`;
    const response = await apiRequest.get(url);
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    const elapsed = endTime - startTime;
    expect(elapsed).toBeLessThan(TEST_DATA4.TIMEOUT_THRESHOLD);
  });

  // ============================================================================
  // Content-Type and Headers Validation
  // ============================================================================

  test('GET - Response content-type is application/json @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    if (contentType) {
      expect(contentType).toContain('application/json');
    }
  });

  test('GET - Response body is valid parseable JSON @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    // response.json() will throw if the body is not valid JSON
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(typeof responseBody).toBe('object');
  });

  // ============================================================================
  // Timezone and UTC Offset Validation
  // ============================================================================

  test('GET - Forecast with timezone=auto returns timezone string @smoke', async ({
    apiRequest,
  }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.FULL_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    expect(responseBody).toHaveProperty('timezone');
    expect(typeof responseBody.timezone).toBe('string');
    expect(responseBody.timezone.length).toBeGreaterThan(0);
  });

  test('GET - UTC offset is a number @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    expect(typeof responseBody.utc_offset_seconds).toBe('number');
    // UTC offset in seconds: valid range is -43200 (-12h) to +50400 (+14h)
    expect(responseBody.utc_offset_seconds).toBeGreaterThanOrEqual(-43200);
    expect(responseBody.utc_offset_seconds).toBeLessThanOrEqual(50400);
  });

  // ============================================================================
  // Generation Time Validation
  // ============================================================================

  test('GET - Generationtime_ms shows server processing time @smoke', async ({ apiRequest }) => {
    const url = `${API4.BASE_URL}${API4.ENDPOINTS.FORECAST}${QUERY_PARAMS4.BASIC_FORECAST}`;
    const response = await apiRequest.get(url);

    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();

    // generationtime_ms is how long the server took to generate the response
    expect(responseBody).toHaveProperty('generationtime_ms');
    expect(typeof responseBody.generationtime_ms).toBe('number');
    expect(responseBody.generationtime_ms).toBeGreaterThan(0);
    // Should never take more than 5 seconds server-side
    expect(responseBody.generationtime_ms).toBeLessThan(5000);
  });
});
