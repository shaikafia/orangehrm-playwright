/**
 * API Test Helpers
 * Contains utility functions for URL building, validation, and response assertions.
 *
 * UPDATED: buildApiUrl now accepts an optional 4th parameter `baseUrl`.
 * This lets api3.spec.ts (REST Countries) and api4.spec.ts (Open Meteo) pass
 * their own base URL instead of always defaulting to the OrangeHRM base URL.
 * All existing OrangeHRM tests keep working because the 4th param is optional.
 */

import { API } from './api.constants';

/**
 * Validate JWT format (xxx.yy.zzz)
 * Matches three base64url parts separated by periods
 * @param token - Token string to validate
 * @returns true if token matches JWT pattern
 */
export const isJwt = (token: string): boolean => {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
};

export const tokenPrefix = 'token=';
export const BEARER_TOKEN_PREFIX = 'Bearer ';

/**
 * Build a complete API URL with optional ID, query parameters, and base URL.
 *
 * @param endpoint    - API endpoint path, e.g. "/pim/employees" or "/name"
 * @param id          - Optional resource ID or path segment, e.g. 7 or "US"
 * @param queryParams - Optional query string, e.g. "?limit=5&offset=0"
 * @param baseUrl     - Optional base URL override (defaults to OrangeHRM BASE_URL)
 * @returns Complete API URL string
 *
 * Examples:
 *   buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=5')
 *   → "https://...orangehrm.../pim/employees?limit=5"
 *
 *   buildApiUrl(API3.ENDPOINTS.ALPHA, 'US', undefined, API3.BASE_URL)
 *   → "https://restcountries.com/v3.1/alpha/US"
 *
 *   buildApiUrl(API4.ENDPOINTS.ELEVATION, undefined, '?latitude=40&longitude=-74', API4.BASE_URL)
 *   → "https://api.open-meteo.com/v1/elevation?latitude=40&longitude=-74"
 */
export const buildApiUrl = (
  endpoint: string,
  id?: string | number,
  queryParams?: string,
  baseUrl?: string          // ← Optional 4th parameter
): string => {
  // Use the provided baseUrl, or fall back to OrangeHRM BASE_URL
  const base = baseUrl ?? API.BASE_URL;
  let url = `${base}${endpoint}`;

  if (id !== undefined) {
    url += `/${id}`;
  }

  if (queryParams) {
    url += queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
  }

  return url;
};

/**
 * Validate paginated list response structure (OrangeHRM API format).
 * OrangeHRM wraps list results in: { data: [...], meta: { total: N } }
 *
 * @param data - Response body from a list endpoint
 * @returns true if valid list structure
 */
export const validateListResponse = (data: any): boolean => {
  return (
    Array.isArray(data.data) &&
    typeof data.meta === 'object' &&
    typeof data.meta.total === 'number'
  );
};

/**
 * Validate a single OrangeHRM employee structure.
 * Checks field existence AND correct TypeScript types.
 *
 * @param data - Employee object from response
 * @returns true if valid employee structure
 */
export const validateEmployeeStructure = (data: any): boolean => {
  return (
    typeof data.empNumber === 'number' &&
    typeof data.firstName === 'string' &&
    typeof data.lastName === 'string'
  );
};

/**
 * Validate OrangeHRM auth token response (after login).
 *
 * @param data - Response body from login endpoint
 * @returns true if valid token structure
 */
export const validateAuthTokenResponse = (data: any): boolean => {
  return (
    typeof data.data?.token === 'string' &&
    data.data.token.length > 0
  );
};

/**
 * Validate error response structure (OrangeHRM 4xx responses).
 * OrangeHRM returns: { error: { status: "422", message: "..." } }
 *
 * @param data - Error response object
 * @returns true if valid OrangeHRM error structure
 */
export const validateErrorResponse = (data: any): boolean => {
  return (
    typeof data.error === 'object' &&
    data.error !== null &&
    typeof data.error.status === 'string'
  );
};

/**
 * Validate leave type structure.
 *
 * @param data - Leave type object from response
 * @returns true if valid leave type structure
 */
export const validateLeaveTypeStructure = (data: any): boolean => {
  return (
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.deleted === 'boolean'
  );
};

/**
 * Validate user structure (admin/users endpoint).
 *
 * @param data - User object from response
 * @returns true if valid user structure
 */
export const validateUserStructure = (data: any): boolean => {
  return (
    typeof data.id === 'number' &&
    typeof data.userName === 'string' &&
    typeof data.role === 'object' &&
    typeof data.status === 'object'
  );
};

/**
 * Validate email format using regex
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate ISO date string format
 * @param dateString - Date string to validate
 * @returns true if valid ISO date format
 */
export const validateISODateFormat = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate created user response structure (for POST responses)
 * @param data - User object from POST response
 * @returns true if valid created user structure
 */
export const validateCreatedUserStructure = (data: any): boolean => {
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.job === 'string' &&
    typeof data.createdAt === 'string'
  );
};

/**
 * Validate resource response structure (for /unknown endpoint on ReqRes)
 * @param data - Resource object from response
 * @returns true if valid resource structure
 */
export const validateResourceStructure = (data: any): boolean => {
  return (
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.year === 'number' &&
    typeof data.color === 'string' &&
    typeof data.pantone_value === 'string'
  );
};
export const validateRestfulBookerAuthToken = (data: any): boolean => {
  return (
    typeof data.token === 'string' &&
    data.token.length > 0
  );
};

export const validateBookingStructure = (data: any): boolean => {
  return (
    typeof data.firstname === 'string' &&
    typeof data.lastname === 'string' &&
    typeof data.totalprice === 'number' &&
    typeof data.depositpaid === 'boolean' &&
    typeof data.bookingdates === 'object' &&
    data.bookingdates !== null &&
    typeof data.bookingdates.checkin === 'string' &&
    typeof data.bookingdates.checkout === 'string'
  );
};