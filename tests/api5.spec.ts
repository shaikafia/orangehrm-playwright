import { test, expect } from '@playwright/test';
import { API5 } from './utils/api5.constants';
import {
  tokenPrefix,
  validateRestfulBookerAuthToken,
  validateBookingStructure,
} from './utils/api-test.helpers';
import {
  sampleBooking,
  updatedBooking,
  patchedBooking,
  filterParams,
} from './utils/api5-test-data';

let token = '';
let createdBookingId: number;

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

test.describe.serial('Restful Booker API – Authentication & Token handling', () => {
  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: API5.CREDENTIALS,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    token = body.token as string;
    expect(validateRestfulBookerAuthToken(body)).toBeTruthy();
    await request.dispose();
  });

  test('Login returns a token', async () => {
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — BOOKING CRUD
// ─────────────────────────────────────────────────────────────────────────────

test.describe.serial('Restful Booker API – Booking CRUD', () => {
  test('Create a new booking', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
    expect(validateBookingStructure(body.booking)).toBeTruthy();
    createdBookingId = body.bookingid as number;
  });

  test('Update the booking using PUT', async ({ request }) => {
    const updatedPayload = { ...sampleBooking, ...updatedBooking };
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        data: updatedPayload,
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstname).toBe(updatedBooking.firstname);
    expect(body.totalprice).toBe(updatedBooking.totalprice);
  });

  test('Retrieve the updated booking and verify changes', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`
    );
    expect(resp.ok()).toBeTruthy();
    const booking = await resp.json();
    expect(booking.firstname).toBe(updatedBooking.firstname);
    expect(booking.totalprice).toBe(updatedBooking.totalprice);
  });

  test('Partially update the booking using PATCH', async ({ request }) => {
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        data: patchedBooking,
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstname).toBe(patchedBooking.firstname);
    expect(body.additionalneeds).toBe(patchedBooking.additionalneeds);
    expect(body.totalprice).toBe(updatedBooking.totalprice);
  });

  test('Delete the booking', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).toBe(201);
    const getResp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`
    );
    expect(getResp.status()).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 — HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

test('Health check – GET /ping returns OK', async ({ request }) => {
  const resp = await request.get(`${API5.BASE_URL}/ping`);
  expect(resp.ok()).toBeTruthy();
  const body = await resp.text();
  expect(body).toContain(API5.HEALTH_CHECK_RESPONSE);
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4 — NEGATIVE TESTS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Restful Booker API – Negative Tests', () => {
  test('Login with invalid credentials returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: API5.INVALID_CREDENTIALS,
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.reason).toBe(API5.ERROR_MESSAGES.BAD_CREDENTIALS);
    expect(body.token).toBeUndefined();
  });

  test('Login with empty username returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: { username: '', password: API5.CREDENTIALS.password },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.reason).toBeDefined();
    expect(body.token).toBeUndefined();
  });

  test('Login with empty password returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: { username: API5.CREDENTIALS.username, password: '' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.reason).toBeDefined();
    expect(body.token).toBeUndefined();
  });

  test('Login with empty body returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: {},
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.reason).toBeDefined();
    expect(body.token).toBeUndefined();
  });

  test('Create booking with missing required fields returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { firstname: sampleBooking.firstname },
    });
    expect(resp.ok()).toBeFalsy();
  });

  test('Create booking with empty firstname is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { ...sampleBooking, firstname: '' },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with empty lastname is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { ...sampleBooking, lastname: '' },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with price as string is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { ...sampleBooking, totalprice: 'not-a-number' },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with invalid date format is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: {
        ...sampleBooking,
        bookingdates: { checkin: '20-11-2026', checkout: '25/11/2026' },
      },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with very long firstname is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { ...sampleBooking, firstname: 'A'.repeat(1000) },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with special characters in name is handled', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: {
        ...sampleBooking,
        firstname: API5.SPECIAL_CHARACTERS.FIRSTNAME,
        lastname: API5.SPECIAL_CHARACTERS.LASTNAME,
      },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Create booking with negative price is handled by server', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { ...sampleBooking, totalprice: -999 },
    });
    expect(resp.status()).not.toBe(500);
  });

  test('Get a booking that does not exist returns 404', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.INVALID_BOOKING}`
    );
    expect(resp.status()).toBe(404);
  });

  test('Get booking with non-numeric ID returns 404', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/abc`
    );
    expect(resp.status()).toBe(404);
  });

  test('Update a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`,
      { data: { ...sampleBooking, firstname: 'Hacker' } }
    );
    expect(resp.status()).toBe(403);
  });

  test('PUT with invalid token returns 403', async ({ request }) => {
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`,
      {
        data: sampleBooking,
        headers: { Cookie: API5.INVALID_TOKEN },
      }
    );
    expect(resp.status()).toBe(403);
  });

  test('PUT non-existent booking with valid token returns 405', async ({ request }) => {
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.INVALID_BOOKING}`,
      {
        data: sampleBooking,
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).toBe(405);
  });

  test('PUT with missing required fields returns error', async ({ request }) => {
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`,
      {
        data: { firstname: sampleBooking.firstname },
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).not.toBe(200);
  });

  test('Patch a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`,
      { data: { firstname: 'Hacker' } }
    );
    expect(resp.status()).toBe(403);
  });

  test('PATCH with invalid token returns 403', async ({ request }) => {
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`,
      {
        data: { firstname: 'Hacker' },
        headers: { Cookie: API5.INVALID_TOKEN },
      }
    );
    expect(resp.status()).toBe(403);
  });

  test('PATCH non-existent booking returns 405', async ({ request }) => {
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.INVALID_BOOKING}`,
      {
        data: { firstname: patchedBooking.firstname },
        headers: { Cookie: `${tokenPrefix}${token}` },
      }
    );
    expect(resp.status()).toBe(405);
  });

  test('Delete a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.VALID_BOOKING}`
    );
    expect(resp.status()).toBe(403);
  });

  test('Delete a booking with invalid token returns 403', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.INVALID_BOOKING}`,
      { headers: { Cookie: API5.INVALID_TOKEN } }
    );
    expect(resp.status()).toBe(403);
  });

  test('DELETE non-existent booking with valid token returns 405', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${API5.IDS.INVALID_BOOKING}`,
      { headers: { Cookie: `${tokenPrefix}${token}` } }
    );
    expect(resp.status()).toBe(405);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5 — EXTENDED TESTS (GET ALL, FILTER, PERFORMANCE)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Restful Booker API – Extended Tests', () => {
  test('Get all bookings returns array of booking IDs', async ({ request }) => {
    const resp = await request.get(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    body.forEach((item: any) => {
      expect(typeof item.bookingid).toBe('number');
    });
  });

  test('Filter bookings by firstname returns matching results', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}?firstname=${filterParams.firstname}`
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('Filter bookings by lastname returns matching results', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}?lastname=${filterParams.lastname}`
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('Filter bookings by checkin and checkout date returns array', async ({ request }) => {
    const resp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}?checkin=${filterParams.checkin}&checkout=${filterParams.checkout}`
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET all bookings responds within timeout', async ({ request }) => {
    const start = Date.now();
    const resp = await request.get(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`);
    const elapsed = Date.now() - start;
    expect(resp.status()).toBe(200);
    expect(elapsed).toBeLessThan(API5.TIMEOUTS.GET_RESPONSE);
    console.log(`Response time: ${elapsed}ms`);
  });

  test('POST login responds within timeout', async ({ request }) => {
    const start = Date.now();
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: API5.CREDENTIALS,
    });
    const elapsed = Date.now() - start;
    expect(resp.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(API5.TIMEOUTS.POST_RESPONSE);
    console.log(`Login response time: ${elapsed}ms`);
  });
});