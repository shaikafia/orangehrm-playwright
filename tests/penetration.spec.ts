import { test, expect } from './utils/api.fixtures';
import { API } from './utils/api.constants';
import { buildApiUrl } from './utils/api-test.helpers';
import { TEST_PAYLOADS } from './utils/constants';

test.describe('Penetration Testing - Security Attacks @security', () => {

  // ============================================================================
  // SQL Injection Attacks
  // Attacker tries to inject SQL code into fields to access/destroy the database
  // ============================================================================

  test.describe('SQL Injection Attacks', () => {

    test('POST - SQL injection in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.sql,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('data');
      }
    });

    test('POST - SQL injection in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.sql,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - SQL injection in user username should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        username: TEST_PAYLOADS.sql,
        password: 'TestPass123!',
        status: true,
        userRole: { id: 1, name: 'Admin' },
        employee: { empNumber: 1 },
      });
      expect([200, 400, 403, 422]).toContain(response.status());
    });

    test('GET - SQL injection in employee search query should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=10&offset=0&name=${encodeURIComponent(TEST_PAYLOADS.sql)}`
      );
      const response = await apiRequest.get(url);
      expect([200, 400, 422]).toContain(response.status());
    });

  });

  // ============================================================================
  // XSS - Cross Site Scripting Attacks
  // Attacker tries to inject JavaScript that runs in other users' browsers
  // ============================================================================

  test.describe('XSS - Cross Site Scripting Attacks', () => {

    test('POST - XSS payload in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.xss,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('data');
      }
    });

    test('POST - XSS payload in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.xss,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - XSS payload in employee middleName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: TEST_PAYLOADS.xss,
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - XSS payload in user username should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        username: TEST_PAYLOADS.xss,
        password: 'TestPass123!',
        status: true,
        userRole: { id: 1, name: 'Admin' },
        employee: { empNumber: 1 },
      });
      expect([200, 400, 403, 422]).toContain(response.status());
    });

  });

  // ============================================================================
  // Command Injection Attacks
  // Attacker tries to run terminal/server commands through API fields
  // e.g. "; rm -rf /" would delete everything on a Linux server
  // ============================================================================

  test.describe('Command Injection Attacks', () => {

    test('POST - Command injection in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.commandInjection,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('data');
      }
    });

    test('POST - Command injection in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.commandInjection,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Command injection in user username should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        username: TEST_PAYLOADS.commandInjection,
        password: 'TestPass123!',
        status: true,
        userRole: { id: 1, name: 'Admin' },
        employee: { empNumber: 1 },
      });
      expect([200, 400, 403, 422]).toContain(response.status());
    });

  });

  // ============================================================================
  // Path Traversal Attacks
  // Attacker tries to navigate to sensitive files on the server
  // e.g. "../../../etc/passwd" to read Linux password file
  // ============================================================================

  test.describe('Path Traversal Attacks', () => {

    test('POST - Path traversal in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.pathTraversal,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Path traversal in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.pathTraversal,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('GET - Path traversal in search query should not expose server files', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=10&offset=0&name=${encodeURIComponent(TEST_PAYLOADS.pathTraversal)}`
      );
      const response = await apiRequest.get(url);
      expect([200, 400, 422]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        // Response should NOT contain server file contents
        const bodyString = JSON.stringify(body);
        expect(bodyString).not.toContain('root:');
        expect(bodyString).not.toContain('/bin/bash');
      }
    });

  });

  // ============================================================================
  // Large Input / Buffer Overflow Attacks
  // Attacker sends huge amounts of data to crash or slow down the server
  // ============================================================================

  test.describe('Large Input - Buffer Overflow Attacks', () => {

    test('POST - Large input in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.largeInput,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 413, 422]).toContain(response.status());
      if (response.status() === 200) {
        const body = await response.json();
        expect(body).toHaveProperty('data');
      }
    });

    test('POST - Large input in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.largeInput,
        employeeId: '',
      });
      expect([200, 400, 413, 422]).toContain(response.status());
    });

    test('POST - Large input in user username should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        username: TEST_PAYLOADS.largeInput,
        password: 'TestPass123!',
        status: true,
        userRole: { id: 1, name: 'Admin' },
        employee: { empNumber: 1 },
      });
      expect([200, 400, 403, 413, 422]).toContain(response.status());
    });

    test('GET - Extremely large query param should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=10&offset=0&name=${'A'.repeat(5000)}`
      );
      const response = await apiRequest.get(url);
      expect([200, 400, 414, 422]).toContain(response.status());
    });

  });

  // ============================================================================
  // Special Characters Attacks
  // Attacker uses special characters to break parsing or cause unexpected behavior
  // ============================================================================

  test.describe('Special Characters Attacks', () => {

    test('POST - Special chars in employee firstName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: TEST_PAYLOADS.specialChars,
        middleName: '',
        lastName: 'TestLast',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Special chars in employee lastName should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 'TestFirst',
        middleName: '',
        lastName: TEST_PAYLOADS.specialChars,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Special chars in user username should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.USERS);
      const response = await apiRequest.post(url, {
        username: TEST_PAYLOADS.specialChars,
        password: 'TestPass123!',
        status: true,
        userRole: { id: 1, name: 'Admin' },
        employee: { empNumber: 1 },
      });
      expect([200, 400, 403, 422]).toContain(response.status());
    });

    test('GET - Special chars in search query should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(
        API.ENDPOINTS.EMPLOYEES,
        undefined,
        `?limit=10&offset=0&name=${encodeURIComponent(TEST_PAYLOADS.specialChars)}`
      );
      const response = await apiRequest.get(url);
      expect([200, 400, 422]).toContain(response.status());
    });

  });

  // ============================================================================
  // Empty & Null Input Attacks
  // Attacker sends empty, null, or missing fields to break validation
  // ============================================================================

  test.describe('Empty and Null Input Attacks', () => {

    test('POST - Empty string in all employee fields should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: '',
        middleName: '',
        lastName: '',
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Null values in employee fields should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: null,
        middleName: null,
        lastName: null,
        employeeId: null,
      });
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Missing required fields in employee should return error not crash', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {});
      expect([200, 400, 422]).toContain(response.status());
    });

    test('POST - Numeric values in string fields should not crash API', async ({ apiRequest }) => {
      const url = buildApiUrl(API.ENDPOINTS.EMPLOYEES);
      const response = await apiRequest.post(url, {
        firstName: 12345,
        middleName: 0,
        lastName: 99999,
        employeeId: '',
      });
      expect([200, 400, 422]).toContain(response.status());
    });

  });

});