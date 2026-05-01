/**
 * API4 Test Fixtures for Open Meteo Weather API
 * Uses generic fixture factory with Open Meteo configuration.
 * No authentication required — Open Meteo is a free, open public API.
 */

import { createApiFixture } from './api-generic.fixtures';

/**
 * Extended test fixture with pre-configured API request context for Open Meteo.
 * No API key needed — simple GET requests with query params.
 */
export const test = createApiFixture({
  apiName: 'Open Meteo',
});
