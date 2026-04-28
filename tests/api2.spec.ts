
import { test, expect } from './utils/api.fixtures';
import { API2 } from './utils/api2.constants';
import {
  TEST_POST_IDS,
  TEST_USER_IDS,
  TEST_TODO_IDS,
  TEST_COMMENT_IDS,
  TEST_PAGINATION2,
  TEST_TIMEOUTS2,
  createPostPayload,
  updatePostPayload,
  createTodoPayload,
} from './utils/api2-testdata';

// Helper: build a JSONPlaceholder URL (same pattern as buildApiUrl but for API2.BASE_URL)
const buildUrl = (
  endpoint: string,
  id?: string | number,
  queryParams?: string
): string => {
  let url = `${API2.BASE_URL}${endpoint}`;
  if (id !== undefined) url += `/${id}`;
  if (queryParams) url += queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
  return url;
};

test.describe('JSONPlaceholder API Testing @regression', () => {

  // ============================================================================
  // Posts Endpoints
  // ============================================================================

  test.describe('Posts Endpoints @smoke', () => {

    test('GET - Fetch all posts returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(50); // JSONPlaceholder always has 100 posts
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('title');
      expect(body[0]).toHaveProperty('body');
      expect(body[0]).toHaveProperty('userId');
    });

    test('GET - Fetch single post by valid ID @smoke', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.id).toBe(TEST_POST_IDS.VALID);
      expect(typeof body.title).toBe('string');
      expect(typeof body.body).toBe('string');
      expect(typeof body.userId).toBe('number');
      expect(body.title.length).toBeGreaterThan(0);
      expect(body.body.length).toBeGreaterThan(0);
    });

    test('GET - Fetch non-existent post returns 404', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.INVALID);
      const response = await request.get(url);

      expect(response.status()).toBe(404);
    });

    test('GET - Fetch posts with _limit query param', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, `?_limit=${TEST_PAGINATION2.SMALL_LIMIT}`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeLessThanOrEqual(TEST_PAGINATION2.SMALL_LIMIT);
    });

    test('GET - Fetch posts with _start and _limit pagination', async ({ request }) => {
      const url = buildUrl(
        API2.ENDPOINTS.POSTS,
        undefined,
        `?_start=${TEST_PAGINATION2.PAGED_START}&_limit=${TEST_PAGINATION2.PAGED_LIMIT}`
      );
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeLessThanOrEqual(TEST_PAGINATION2.PAGED_LIMIT);
    });

    test('GET - Fetch posts filtered by userId returns only that user\'s posts', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${TEST_USER_IDS.VALID}`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      body.forEach((post: any) => {
        expect(post.userId).toBe(TEST_USER_IDS.VALID);
      });
    });

    test('GET - Filter posts by non-existent userId returns empty array not 404', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${TEST_USER_IDS.INVALID}`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBe(0);
    });

    test('POST - Create a new post returns 201 with echoed data', async ({ request }) => {
      const payload = createPostPayload();
      const url = buildUrl(API2.ENDPOINTS.POSTS);
      const response = await request.post(url, { data: payload });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(typeof body.id).toBe('number');
      expect(body.title).toBe(payload.title);
      expect(body.body).toBe(payload.body);
      expect(body.userId).toBe(payload.userId);
    });

    test('POST - Create post and verify ID is returned', async ({ request }) => {
      const payload = createPostPayload({ title: 'Brand New Post', userId: 5 });
      const url = buildUrl(API2.ENDPOINTS.POSTS);
      const response = await request.post(url, { data: payload });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.id).toBeDefined();
      expect(typeof body.id).toBe('number');
      expect(body.title).toBe(payload.title);
    });

    test('PUT - Update an existing post returns 200 with updated fields', async ({ request }) => {
      const payload = updatePostPayload();
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const response = await request.put(url, { data: payload });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(TEST_POST_IDS.VALID);
      expect(body.title).toBe(payload.title);
      expect(body.body).toBe(payload.body);
    });

    test('PATCH - Partially update a post title returns 200', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const response = await request.patch(url, { data: { title: 'Patched Title Only' } });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.title).toBe('Patched Title Only');
    });

    test('DELETE - Delete a post returns 200', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const response = await request.delete(url);

      expect(response.status()).toBe(200);
    });

    test('GET - Same post request twice returns consistent data', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);

      const response1 = await request.get(url);
      const data1 = await response1.json();

      const response2 = await request.get(url);
      const data2 = await response2.json();

      expect(data1.id).toBe(data2.id);
      expect(data1.title).toBe(data2.title);
      expect(data1.body).toBe(data2.body);
    });

  }); 

  // ============================================================================
  // Comments Endpoints
  // ============================================================================

  test.describe('Comments Endpoints @smoke', () => {

    test('GET - Fetch all comments returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.COMMENTS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single comment has all required fields', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.COMMENTS, TEST_COMMENT_IDS.VALID);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(TEST_COMMENT_IDS.VALID);
      expect(body).toHaveProperty('postId');
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('body');
      expect(body.email).toContain('@');
    });

    test('GET - Fetch comments filtered by postId', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.COMMENTS, undefined, '?postId=1');
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      body.forEach((comment: any) => {
        expect(comment.postId).toBe(1);
      });
    });

    test('GET - Fetch comments with multiple filters (postId + sort + limit)', async ({ request }) => {
      const url = buildUrl(
        API2.ENDPOINTS.COMMENTS,
        undefined,
        '?postId=1&_sort=id&_order=desc&_limit=5'
      );
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeLessThanOrEqual(5);
      body.forEach((comment: any) => {
        expect(comment.postId).toBe(1);
      });
    });

  });

  // ============================================================================
  // Users Endpoints
  // ============================================================================

  test.describe('Users Endpoints @smoke', () => {

    test('GET - Fetch all users returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.USERS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single user has name, username, email, address with geo', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(TEST_USER_IDS.VALID);
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('username');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('address');
      expect(body.address).toHaveProperty('geo');
      expect(typeof body.name).toBe('string');
      expect(typeof body.username).toBe('string');
      expect(body.email).toContain('@');
    });

    test('GET - Fetch multiple users sequentially all return correct IDs', async ({ request }) => {
      for (const userId of [1, 2, 3]) {
        const url = buildUrl(API2.ENDPOINTS.USERS, userId);
        const response = await request.get(url);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(userId);
        expect(typeof body.name).toBe('string');
      }
    });

  }); 

  // ============================================================================
  // Todos Endpoints
  // ============================================================================

  test.describe('Todos Endpoints @smoke', () => {

    test('GET - Fetch all todos returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
    });

    test('GET - Fetch single todo has userId, title, completed as boolean', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS, TEST_TODO_IDS.VALID);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(TEST_TODO_IDS.VALID);
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('completed');
      expect(typeof body.completed).toBe('boolean');
      expect(typeof body.title).toBe('string');
    });

    test('GET - Fetch incomplete todos for user 1 all have completed=false', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS, undefined, `?userId=${TEST_USER_IDS.VALID}&completed=false`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      body.forEach((todo: any) => {
        expect(todo.userId).toBe(TEST_USER_IDS.VALID);
        expect(todo.completed).toBe(false);
      });
    });

    test('GET - Todos sorted by completed ascending', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS, undefined, '?_sort=completed&_order=asc');
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
    });

    test('POST - Create a new todo returns 201 with correct data', async ({ request }) => {
      const payload = createTodoPayload();
      const url = buildUrl(API2.ENDPOINTS.TODOS);
      const response = await request.post(url, { data: payload });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(payload.title);
      expect(body.completed).toBe(payload.completed);
      expect(body.userId).toBe(payload.userId);
    });

    test('POST - Create todo with minimal data (title + userId only)', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS);
      const response = await request.post(url, {
        data: { title: 'Minimal Todo', userId: TEST_USER_IDS.VALID }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.title).toBe('Minimal Todo');
      expect(body.userId).toBe(TEST_USER_IDS.VALID);
    });

    test('PUT - Mark todo as completed returns 200 with completed=true', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.TODOS, TEST_TODO_IDS.VALID);
      const response = await request.put(url, { data: { completed: true } });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.completed).toBe(true);
    });

  }); // closes Todos

  // ============================================================================
  // Albums Endpoints
  // ============================================================================

  test.describe('Albums Endpoints @smoke', () => {

    test('GET - Fetch all albums returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.ALBUMS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
    });

    test('GET - Fetch albums filtered by userId all belong to that user', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.ALBUMS, undefined, `?userId=${TEST_USER_IDS.VALID}`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      body.forEach((album: any) => {
        expect(album.userId).toBe(TEST_USER_IDS.VALID);
      });
    });

  }); // closes Albums

  // ============================================================================
  // Photos Endpoints
  // ============================================================================

  test.describe('Photos Endpoints @smoke', () => {

    test('GET - Fetch all photos returns 200 and non-empty array', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.PHOTOS);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('albumId');
      expect(body[0]).toHaveProperty('title');
      expect(body[0]).toHaveProperty('url');
    });

    test('GET - Fetch single photo has all required fields including thumbnailUrl', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.PHOTOS, 1);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('albumId');
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('url');
      expect(body).toHaveProperty('thumbnailUrl');
    });

    test('GET - Fetch photos filtered by albumId all belong to that album', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.PHOTOS, undefined, '?albumId=1');
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      body.forEach((photo: any) => {
        expect(photo.albumId).toBe(1);
      });
    });

  }); // closes Photos

  // ============================================================================
  // Response Headers & Content Types
  // ============================================================================

  test.describe('Response Headers & Content Types', () => {

    test('GET - Posts response content-type is application/json', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const response = await request.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('GET - Users response content-type is application/json', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.USERS, TEST_USER_IDS.VALID);
      const response = await request.get(url);

      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('application/json');
    });

  }); // closes Headers

  // ============================================================================
  // Performance & Response Time
  // ============================================================================

  test.describe('Performance & Response Time', () => {

    test('GET - Posts list response time is within acceptable limit', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, `?_limit=${TEST_PAGINATION2.SMALL_LIMIT}`);
      const startTime = Date.now();
      const response = await request.get(url);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS2.GET_RESPONSE);
    });

    test('GET - Single post response time is within acceptable limit', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);
      const startTime = Date.now();
      const response = await request.get(url);
      const endTime = Date.now();

      expect(response.ok()).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(TEST_TIMEOUTS2.GET_RESPONSE);
    });

  }); // closes Performance

  // ============================================================================
  // Error Scenarios & Edge Cases
  // ============================================================================

  test.describe('Error Scenarios & Edge Cases', () => {

    test('GET - Non-existent post returns 404', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.INVALID);
      const response = await request.get(url);

      expect(response.status()).toBe(404);
    });

    test('GET - Filter by non-existent userId returns empty array not 404', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, `?userId=${TEST_USER_IDS.INVALID}`);
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBe(0);
    });

    test('GET - Invalid query parameter is ignored and still returns 200', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, undefined, '?invalidParam=true');
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('GET - Same request twice returns consistent data', async ({ request }) => {
      const url = buildUrl(API2.ENDPOINTS.POSTS, TEST_POST_IDS.VALID);

      const response1 = await request.get(url);
      const data1 = await response1.json();

      const response2 = await request.get(url);
      const data2 = await response2.json();

      expect(data1.id).toBe(data2.id);
      expect(data1.title).toBe(data2.title);
      expect(data1.body).toBe(data2.body);
    });

  }); // closes Error Scenarios

}); // closes JSONPlaceholder API Testing @regression