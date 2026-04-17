import { test, expect } from './utils/api.fixtures';
import { API } from './utils/api.constants';
import {
  buildApiUrl,
  validateListResponse,
  validateEmployeeStructure,
  validateAuthTokenResponse,
  validateErrorResponse,
  validateLeaveTypeStructure,
  validateUserStructure,
} from './utils/api-test.helpers';
import {
  TEST_EMPLOYEE_IDS,
  TEST_PAGINATION,
  TEST_TIMEOUTS,
  TEST_ADMIN_CREDENTIALS,
  createLoginPayload,
  createEmployeePayload,
  createInvalidLoginPayload,
} from './utils/api-test.data';
import { TEST_PAYLOADS } from './utils/constants';

test.describe('OrangeHRM API Testing @regression', () => {
  // ============================================================================
  // Authentication Endpoints @critical
  // ============================================================================
  // NOTE: The OrangeHRM demo server does not expose a public /auth/login API endpoint.
  // API authentication is not available via the /web/index.php/api/v2 base URL.
  // Instead, session-based authentication (cookies) from the UI login is used.
  // These tests are marked as .skip because the endpoint returns 404.
  // ============================================================================

  test.describe('Authentication Endpoints @critical', () => {
    test.skip('POST - Login with valid credentials returns token @smoke', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await request.post(url, { data: createLoginPayload() });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(validateAuthTokenResponse(responseBody)).toBeTruthy();
    });

    test.skip('POST - Login with invalid password returns 401', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await request.post(url, {
        data: createLoginPayload({ password: TEST_ADMIN_CREDENTIALS.INVALID_PASSWORD }),
      });

      expect(response.status()).toBe(401);
    });

    test.skip('POST - Login with missing password returns error', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await request.post(url, { data: createInvalidLoginPayload() });

      expect([400, 401, 422]).toContain(response.status());
    });

    test.skip('POST - Login with invalid username returns 401', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.LOGIN);
      const response = await request.post(url, {
        data: createLoginPayload({ username: TEST_ADMIN_CREDENTIALS.INVALID_USERNAME }),
      });

      expect(response.status()).toBe(401);
    });
  });

  // ============================================================================
  // Employee / PIM Endpoints (CRUD)
  // ============================================================================

  test.describe('Employee Endpoints - CRUD @smoke', () => {
    test('GET - Fetch list of employees @smoke', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=${TEST_PAGINATION.VALID_LIMIT}&offset=${TEST_PAGINATION.VALID_OFFSET}`
      );
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(validateListResponse(responseBody)).toBeTruthy();
      expect(responseBody.data.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single employee by valid ID @smoke', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEE_BY_ID, TEST_EMPLOYEE_IDS.VALID);
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(validateEmployeeStructure(responseBody.data)).toBeTruthy();
      expect(responseBody.data.empNumber).toBe(TEST_EMPLOYEE_IDS.VALID);
    });

    test('GET - Fetch non-existent employee returns 422 (invalid param)', async ({
      apiRequest,
    }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEE_BY_ID, TEST_EMPLOYEE_IDS.INVALID);
      const response = await apiRequest.get(url);

      // OrangeHRM API validates parameters and returns 422 for invalid employee IDs
      expect(response.status()).toBe(422);
    });

    test('POST - Create a new employee @smoke', async ({ apiRequest }) => {
      const newEmployee = createEmployeePayload();
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, newEmployee);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.data.firstName).toBe(newEmployee.firstName);
      expect(responseBody.data.lastName).toBe(newEmployee.lastName);
      expect(typeof responseBody.data.empNumber).toBe('number');
    });
  });

  // ============================================================================
  // Pagination & Query Parameters
  // ============================================================================

  test.describe('Pagination & Query Parameters', () => {
    test('GET - Employee list with custom limit', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=${TEST_PAGINATION.VALID_LIMIT}&offset=${TEST_PAGINATION.VALID_OFFSET}`
      );
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody.data.length).toBeLessThanOrEqual(TEST_PAGINATION.VALID_LIMIT);
    });

    test('GET - Employee list with large limit returns all available records', async ({
      apiRequest,
    }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=${TEST_PAGINATION.LARGE_LIMIT}&offset=${TEST_PAGINATION.VALID_OFFSET}`
      );
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(Array.isArray(responseBody.data)).toBeTruthy();
    });

    test('GET - Employee list meta contains total count', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=1&offset=0');
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(typeof responseBody.meta.total).toBe('number');
      expect(responseBody.meta.total).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Response Headers & Content Types
  // ============================================================================

  test.describe('Response Headers & Content Types', () => {
    test('GET - Response content-type is application/json', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=1&offset=0');
      const response = await apiRequest.get(url);

      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('GET - Single employee response content-type is application/json', async ({
      apiRequest,
    }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEE_BY_ID, TEST_EMPLOYEE_IDS.VALID);
      const response = await apiRequest.get(url);

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  // ============================================================================
  // Leave Endpoints - SKIPPED
  // ============================================================================
  // NOTE: Leave endpoints (/api/v2/leave/leave-types/eligible-leave-types) return 404
  // on the OrangeHRM demo server. These tests are not available.
  // ============================================================================

  test.describe('Leave Endpoints', () => {
    test.skip('GET - Fetch eligible leave types @smoke', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.LEAVE_TYPES);
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody.data)).toBeTruthy();
      expect(responseBody.data.length).toBeGreaterThan(0);
      expect(validateLeaveTypeStructure(responseBody.data[0])).toBeTruthy();
    });

    test.skip('GET - Leave types have name and id fields', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.LEAVE_TYPES);
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();

      responseBody.data.forEach((leaveType: any) => {
        expect(typeof leaveType.id).toBe('number');
        expect(typeof leaveType.name).toBe('string');
      });
    });
  });

  // ============================================================================
  // Admin - User Endpoints
  // ============================================================================

  test.describe('Admin User Endpoints', () => {
    test('GET - Fetch list of admin users @smoke', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.USERS,
        undefined,
        `?limit=${TEST_PAGINATION.VALID_LIMIT}&offset=${TEST_PAGINATION.VALID_OFFSET}`
      );
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const responseBody = await response.json();
      expect(validateListResponse(responseBody)).toBeTruthy();
    });

    test('GET - Admin user list meta total is a number', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, '?limit=1&offset=0');
      const response = await apiRequest.get(url);

      expect(response.ok()).toBeTruthy();
      const responseBody = await response.json();
      expect(typeof responseBody.meta.total).toBe('number');
    });
  });

  // ============================================================================
  // Error Scenarios & Status Codes
  // ============================================================================

  test.describe('Error Scenarios & Status Codes', () => {
    test('GET - Very high employee ID returns 422 (invalid param)', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEE_BY_ID, TEST_EMPLOYEE_IDS.NONEXISTENT);
      const response = await apiRequest.get(url);

      // OrangeHRM API validates parameters and returns 422 for very large invalid employee IDs
      expect(response.status()).toBe(422);
    });

    test.skip('GET - Unauthenticated request to employees returns 401', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=5&offset=0');
      const response = await request.get(url);

      expect([401, 403]).toContain(response.status());
    });

    test.skip('GET - Unauthenticated request to users returns 401', async ({ request }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS, undefined, '?limit=5&offset=0');
      const response = await request.get(url);

      expect([401, 403]).toContain(response.status());
    });
  });

  // ============================================================================
  // Penetration Testing - Injection Attacks
  // ============================================================================

  test.describe('Penetration Testing - Injection Attacks @security', () => {
    test('POST - Create employee with SQL injection in firstName should not crash the API', async ({
      apiRequest,
    }) => {
      const maliciousEmployee = createEmployeePayload({
        firstName: TEST_PAYLOADS.sql,
        lastName: 'TestLast',
      });
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, maliciousEmployee);

      // API should handle the input without crashing (demo may not sanitize)
      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
      }
    });

    test('POST - Create employee with XSS payload in lastName should not crash the API', async ({
      apiRequest,
    }) => {
      const maliciousEmployee = createEmployeePayload({
        firstName: 'TestFirst',
        lastName: TEST_PAYLOADS.xss,
      });
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, maliciousEmployee);

      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
      }
    });

    test('POST - Create employee with command injection in firstName should not crash the API', async ({
      apiRequest,
    }) => {
      const maliciousEmployee = createEmployeePayload({
        firstName: TEST_PAYLOADS.commandInjection,
        lastName: 'TestLast',
      });
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, maliciousEmployee);

      expect([200, 400, 422]).toContain(response.status());
      // Ensure no system command execution (check response structure)
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
      }
    });

    test('POST - Create employee with large input should handle without crashing', async ({
      apiRequest,
    }) => {
      const maliciousEmployee = createEmployeePayload({
        firstName: TEST_PAYLOADS.largeInput,
        lastName: 'TestLast',
      });
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, maliciousEmployee);

      // Demo API accepts large inputs; just ensure it doesn't crash
      expect([200, 400, 413, 422]).toContain(response.status());
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('data');
      }
    });
  });

  // ============================================================================
  // Performance & Response Time
  // ============================================================================

  test.describe('Performance & Response Time', () => {
    test('GET - Employee list response time is within acceptable limit', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=5&offset=0');
      const startTime = Date.now();
      const response = await apiRequest.get(url);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS.RESPONSE_TIME);
    });

    test('GET - Single employee response time is within acceptable limit', async ({
      apiRequest,
    }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEE_BY_ID, TEST_EMPLOYEE_IDS.VALID);
      const startTime = Date.now();
      const response = await apiRequest.get(url);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS.RESPONSE_TIME);
    });
  });

  // ============================================================================
  // Concurrent Requests
  // ============================================================================

  test.describe('Concurrent Requests', () => {
    test('Multiple simultaneous GET requests to employees', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=1&offset=0');
      const promises = Array(3)
        .fill(null)
        .map(() => apiRequest.get(url));
      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
      });
    });

    test.skip('Simultaneous GET to employees and leave types', async ({ apiRequest }) => {
      const employeesUrl = buildApiUrl(API.ENDPOINTS.EMPLOYEES, undefined, '?limit=1&offset=0');
      const leaveUrl = buildApiUrl(API.ENDPOINTS.LEAVE_TYPES);

      const [empResponse, leaveResponse] = await Promise.all([
        apiRequest.get(employeesUrl),
        apiRequest.get(leaveUrl),
      ]);

      expect(empResponse.ok()).toBeTruthy();
      expect(leaveResponse.ok()).toBeTruthy();
    });
  });

  // ============================================================================
  // Data Structure Validation
  // ============================================================================

  test.describe('Data Structure Validation', () => {
    test('GET - All employees in list have valid structure', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=${TEST_PAGINATION.VALID_LIMIT}&offset=0`
      );
      const response = await apiRequest.get(url);
      const responseBody = await response.json();

      responseBody.data.forEach((employee: any) => {
        expect(validateEmployeeStructure(employee)).toBeTruthy();
      });
    });

    test.skip('GET - All users in list have valid structure', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.USERS,
        undefined,
        `?limit=${TEST_PAGINATION.VALID_LIMIT}&offset=0`
      );
      const response = await apiRequest.get(url);
      const responseBody = await response.json();

      // Only validate if users exist in response
      if (responseBody.data && responseBody.data.length > 0) {
        responseBody.data.forEach((user: any) => {
          expect(validateUserStructure(user)).toBeTruthy();
        });
      }
    });
  });
});
