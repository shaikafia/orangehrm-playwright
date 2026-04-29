/**
 * API2 Configuration Constants for JSONPlaceholder
 * Contains base URL and endpoints for the JSONPlaceholder public API
 * No authentication required - free public API for testing
 */

export const API2 = {
  BASE_URL: 'https://jsonplaceholder.typicode.com',
  ENDPOINTS: {
    POSTS:    '/posts',
    COMMENTS: '/comments',
    USERS:    '/users',
    TODOS:    '/todos',
    ALBUMS:   '/albums',
    PHOTOS:   '/photos',
  },
  TIMEOUTS: {
    GET_RESPONSE:  5000,
    POST_RESPONSE: 3000,
  },
};