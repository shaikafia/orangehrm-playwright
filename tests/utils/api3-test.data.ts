/**
 * API4 Test Data for Open Meteo Weather API
 * Contains test data, coordinates, and query parameters for API testing
 */

export const TEST_DATA4 = {
  // Valid geographic coordinates (latitude, longitude)
  VALID_LAT: 40.7128, // New York City
  VALID_LON: -74.006,
  VALID_LAT_2: 51.5074, // London
  VALID_LON_2: -0.1278,
  VALID_LAT_3: 48.8566, // Paris
  VALID_LON_3: 2.3522,
  VALID_LAT_4: 35.6762, // Tokyo
  VALID_LON_4: 139.6503,

  // Invalid coordinates (out of valid range)
  INVALID_LAT: 999, // Max is 90
  INVALID_LON: 999, // Max is 180
  INVALID_LAT_STR: 'abc', // Non-numeric

  // Date range for historical data
  VALID_START_DATE: '2024-01-01',
  VALID_END_DATE: '2024-01-07',
  FUTURE_START_DATE: '2030-01-01',
  FUTURE_END_DATE: '2030-01-07',

  // Performance
  TIMEOUT_THRESHOLD: 10000, // 10 seconds
};

// Query parameters for different request types
export const QUERY_PARAMS4 = {
  // Forecast queries — daily & hourly weather variables
  BASIC_FORECAST: '?latitude=40.7128&longitude=-74.0060&hourly=temperature_2m',

  FULL_FORECAST:
    '?latitude=40.7128&longitude=-74.0060' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
    '&timezone=auto',

  LONDON_FORECAST: '?latitude=51.5074&longitude=-0.1278&hourly=temperature_2m',

  PARIS_FORECAST: '?latitude=48.8566&longitude=2.3522&hourly=temperature_2m',

  TOKYO_FORECAST: '?latitude=35.6762&longitude=139.6503&hourly=temperature_2m',

  // Elevation query
  ELEVATION_QUERY: '?latitude=40.7128&longitude=-74.0060',

  MULTIPLE_ELEVATION: '?latitude=40.7128,51.5074,48.8566&longitude=-74.0060,-0.1278,2.3522',

  // Historical archive query
  HISTORICAL_NYC:
    '?latitude=40.7128&longitude=-74.0060' +
    '&start_date=2024-01-01&end_date=2024-01-07' +
    '&daily=temperature_2m_max,temperature_2m_min',

  // Invalid queries
  MISSING_LAT: '?longitude=-74.0060&hourly=temperature_2m',
  MISSING_LON: '?latitude=40.7128&hourly=temperature_2m',
  INVALID_COORDS: '?latitude=999&longitude=999&hourly=temperature_2m',
};
