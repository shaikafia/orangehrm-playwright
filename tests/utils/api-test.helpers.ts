/**
 * API Test Helpers
 * Contains utility functions for URL building, validation, and response assertions
 */

import { API } from './api.constants';

/**
 * Build a complete API URL with optional ID and query parameters
 * @param endpoint - API endpoint from API.ENDPOINTS
 * @param id - Optional resource ID
 * @param queryParams - Optional query string (e.g., "?limit=5&offset=0")
 * @returns Complete API URL
 */
export const buildApiUrl = (
  endpoint: string,
  id?: string | number,
  queryParams?: string
): string => {
  let url = `${API.BASE_URL}${endpoint}`;
  if (id !== undefined) {
    url += `/${id}`;
  }
  if (queryParams) {
    url += queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
  }
  return url;
};

/**
 * Validate paginated list response structure (OrangeHRM API format)
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
 * Validate a single OrangeHRM employee structure
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
 * Validate OrangeHRM auth token response (after login)
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
 * Validate error response structure
 * @param data - Error response object
 * @returns true if valid OrangeHRM error structure
 */
export const validateErrorResponse = (data: any): boolean => {
  // OrangeHRM returns { error: { status: "...", message: "..." } } on 4xx
  return (
    typeof data.error === 'object' &&
    data.error !== null &&
    typeof data.error.status === 'string'
  );
};

/**
 * Validate leave type structure
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
 * Validate user structure (admin/users endpoint)
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