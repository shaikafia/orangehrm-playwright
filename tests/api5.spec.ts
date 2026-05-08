import { test, expect } from '@playwright/test';
import { API5 } from './utils/api5.constants';
import {
  tokenPrefix,
  validateRestfulBookerAuthToken,
  validateBookingStructure,
} from './utils/api-test.helpers';
import { sampleBooking } from './utils/api5-test-data';

let token = '';
let createdBookingId: number;

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

test.describe.serial('Restful Booker API – Booking CRUD (Basic auth)', () => {
  test('Create a new booking', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: sampleBooking,
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // The API returns { bookingid: number, booking: {...} }
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
    expect(validateBookingStructure(body.booking)).toBeTruthy();
    createdBookingId = body.bookingid as number;
  });

  test('Update the previously created booking using Basic auth', async ({ request }) => {
    const updatedPayload = { ...sampleBooking, firstname: 'Jane', totalprice: 200 };
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        data: updatedPayload,
        headers: {
          Cookie: `${tokenPrefix}${token}`,
        },
      }
    );
    // Successful update returns 200 and the updated booking object.
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstname).toBe(updatedPayload.firstname);
    expect(body.totalprice).toBe(updatedPayload.totalprice);
  });

  test('Retrieve the updated booking and verify changes', async ({ request }) => {
    const resp = await request.get(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`);
    expect(resp.ok()).toBeTruthy();
    const booking = await resp.json();
    expect(booking.firstname).toBe('Jane');
    expect(booking.totalprice).toBe(200);
  });

  test('Partially update the booking using PATCH', async ({ request }) => {
    const patchPayload = { firstname: 'James', additionalneeds: 'Dinner' };
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        data: patchPayload,
        headers: {
          Cookie: `${tokenPrefix}${token}`,
        },
      }
    );
    // Successful patch returns 200 and the updated booking object.
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.firstname).toBe(patchPayload.firstname);
    expect(body.additionalneeds).toBe(patchPayload.additionalneeds);
    // Ensure the other properties from previous updates remain intact
    expect(body.totalprice).toBe(200);
  });

  test('Delete the booking', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`,
      {
        headers: {
          Cookie: `${tokenPrefix}${token}`,
        },
      }
    );
    // Successful deletion in Restful Booker returns 201 Created
    expect(resp.status()).toBe(201);

    // Verify it's actually deleted
    const getResp = await request.get(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/${createdBookingId}`
    );
    expect(getResp.status()).toBe(404);
  });
});

// Optional sanity check – ping endpoint (GET /ping) – not required but demonstrates a simple GET.
test('Health check – GET /ping returns OK', async ({ request }) => {
  const resp = await request.get(`${API5.BASE_URL}/ping`);
  expect(resp.ok()).toBeTruthy();
  const body = await resp.text();
  // The service returns a plain string "Created" when healthy.
  expect(body).toContain('Created');
});

test.describe('Restful Booker API – Negative Tests', () => {

  // AUTH
  test('Login with invalid credentials returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.AUTH}`, {
      data: { username: 'wronguser', password: 'wrongpass' },
    });
    expect(resp.ok()).toBeTruthy(); // API returns 200 even for bad creds
    const body = await resp.json();
    // But the body contains "Bad credentials" instead of a token
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });

  // CREATE
  test('Create booking with missing required fields returns error', async ({ request }) => {
    const resp = await request.post(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}`, {
      data: { firstname: 'John' }, // missing lastname, totalprice, etc.
    });
    expect(resp.ok()).toBeFalsy(); // should NOT be 200
  });

  // GET
  test('Get a booking that does not exist returns 404', async ({ request }) => {
    const resp = await request.get(`${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/9999999`);
    expect(resp.status()).toBe(404);
  });

  // UPDATE
  test('Update a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.put(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/1`,
      {
        data: { ...sampleBooking, firstname: 'Hacker' },
        // No Cookie header — no auth
      }
    );
    expect(resp.status()).toBe(403);
  });

  // PATCH
  test('Patch a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.patch(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/1`,
      {
        data: { firstname: 'Hacker' },
        // No Cookie header — no auth
      }
    );
    expect(resp.status()).toBe(403);
  });

  // DELETE
  test('Delete a booking without auth token returns 403', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/1`
      // No Cookie header — no auth
    );
    expect(resp.status()).toBe(403);
  });

  test('Delete a booking that does not exist returns 405', async ({ request }) => {
    const resp = await request.delete(
      `${API5.BASE_URL}${API5.ENDPOINTS.BOOKING}/9999999`,
      {
        headers: { Cookie: `token=invalidtoken123` },
      }
    );
    expect(resp.status()).toBe(403); // invalid token = 403 before it even checks the ID
  });

});