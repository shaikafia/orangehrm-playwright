/**
 * Test Data for JSONPlaceholder API Tests
 * Contains constants and factory functions matching the project's data layer pattern
 */

// ── Resource IDs ────────────────────────────────────────────────────────────

export const TEST_POST_IDS = {
  VALID:   1,       // Exists in JSONPlaceholder — returns 200
  INVALID: 99999,   // Does not exist — returns 404
};

export const TEST_USER_IDS = {
  VALID:   1,
  INVALID: 99999,
};

export const TEST_TODO_IDS = {
  VALID: 1,
};

export const TEST_COMMENT_IDS = {
  VALID: 1,
};

// ── Pagination ──────────────────────────────────────────────────────────────

export const TEST_PAGINATION2 = {
  SMALL_LIMIT:  5,
  PAGED_START:  0,
  PAGED_LIMIT:  3,
};

// ── Timeouts ────────────────────────────────────────────────────────────────

export const TEST_TIMEOUTS2 = {
  GET_RESPONSE:  5000,
  POST_RESPONSE: 3000,
};

// ── Factory functions ────────────────────────────────────────────────────────

/**
 * Factory: Create a new post payload
 */
export const createPostPayload = (overrides?: Partial<{ title: string; body: string; userId: number }>) => ({
  title:  'Test Post Title',
  body:   'This is a test post body for validating API functionality.',
  userId: 1,
  ...overrides,
});

/**
 * Factory: Create an update post payload (for PUT)
 */
export const updatePostPayload = (overrides?: Partial<{ title: string; body: string; userId: number }>) => ({
  title:  'Updated Post Title',
  body:   'This is an updated test post body.',
  userId: 1,
  ...overrides,
});

/**
 * Factory: Create a new todo payload
 */
export const createTodoPayload = (overrides?: Partial<{ title: string; completed: boolean; userId: number }>) => ({
  title:     'Test Todo Item',
  completed: false,
  userId:    1,
  ...overrides,
});