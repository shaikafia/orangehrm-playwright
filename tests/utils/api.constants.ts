/**
 * API Configuration Constants
 * Contains base URL, endpoints, and timeout configurations for the OrangeHRM API
 */

export const API = {
  BASE_URL: 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2',
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',

    // Employee / PIM
    EMPLOYEES: '/pim/employees',
    EMPLOYEE_BY_ID: '/pim/employees', // append /{empNumber}

    // Leave
    LEAVE_TYPES: '/leave/leave-types/eligible-leave-types',
    LEAVE_REQUESTS: '/leave/leave-requests',
    MY_LEAVE_REQUESTS: '/leave/employees/mine/leave-requests',

    // Admin - Users
    USERS: '/admin/users',

    // Attendance
    ATTENDANCE_RECORDS: '/attendance/records',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
  },
};
export const NASA_API = {
  BASE_URL: 'https://api.nasa.gov',
  API_KEY: 'DEMO_KEY',  // free key for testing, no signup needed
  ENDPOINTS: {
    APOD: '/planetary/apod',       // Astronomy Picture of the Day
    MARS_PHOTOS: '/mars-photos/api/v1/rovers/curiosity/photos',
  }
};