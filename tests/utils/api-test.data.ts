/**
 * Test Data for OrangeHRM API Tests
 * Contains constants, test IDs, credentials, and data factory functions
 */

export const TEST_EMPLOYEE_IDS = {
  VALID: 7,           // Typically exists in the demo instance
  INVALID: 99999,     // Should return 404
  NONEXISTENT: 999999,
};

export const TEST_ADMIN_CREDENTIALS = {
  VALID_USERNAME: 'Admin',
  VALID_PASSWORD: 'admin123',
  INVALID_USERNAME: 'wronguser',
  INVALID_PASSWORD: 'wrongpass',
};

export const TEST_PAGINATION = {
  VALID_LIMIT: 5,
  VALID_OFFSET: 0,
  LARGE_LIMIT: 50,
  INVALID_LIMIT: -1,
};

export const TEST_TIMEOUTS = {
  RESPONSE_TIME: 5000,
  POST_TIME: 3000,
};

export const TEST_LEAVE_DATES = {
  FUTURE_FROM: '2025-12-01',
  FUTURE_TO: '2025-12-03',
  PAST_FROM: '2020-01-01',
  PAST_TO: '2020-01-02',
};

/**
 * Factory: Create a login payload
 */
export const createLoginPayload = (overrides?: Partial<{ username: string; password: string }>) => ({
  username: TEST_ADMIN_CREDENTIALS.VALID_USERNAME,
  password: TEST_ADMIN_CREDENTIALS.VALID_PASSWORD,
  ...overrides,
});

/**
 * Factory: Create an employee payload
 */
export const createEmployeePayload = (overrides?: Partial<any>) => ({
  firstName: 'Test',
  middleName: '',
  lastName: 'ApiUser',
  employeeId: '',
  ...overrides,
});

/**
 * Factory: Create a leave request payload
 */
export const createLeaveRequestPayload = (overrides?: Partial<any>) => ({
  fromDate: TEST_LEAVE_DATES.FUTURE_FROM,
  toDate: TEST_LEAVE_DATES.FUTURE_TO,
  comment: 'API test leave request',
  ...overrides,
});

/**
 * Factory: Create invalid login payload (missing password)
 */
export const createInvalidLoginPayload = () => ({
  username: TEST_ADMIN_CREDENTIALS.VALID_USERNAME,
  // password deliberately omitted
});