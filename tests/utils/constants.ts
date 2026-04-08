export const ERROR_MESSAGES = {
  invalidCredentials: 'Invalid credentials',
  usernameRequired: 'Required',
  passwordRequired: 'Required',
  leaveFromDateRequired: 'Required',
  leaveToDateRequired: 'Required',
  leaveTypeRequired: 'Required',
};

export const SUCCESS_MESSAGES = {
  employeeSaved: 'Successfully Saved',
  employeeUpdated: 'Successfully Updated',
  employeeDeleted: 'Successfully Deleted',
  leaveApplied: 'Successfully Saved',
};

// Security test payloads — centralised so spec file contains no hardcoded attack strings
export const TEST_PAYLOADS = {
  xss: '<script>alert("xss")</script>',
  sql: "' OR '1'='1",
};

// Navigation labels used in assertions — centralised to avoid hardcoding in spec
export const NAV_LABELS = {
  apply: 'Apply',
  employeeList: 'Employee List',
  firstName: 'First Name',
  dashboard: 'Dashboard',
  pim: 'PIM',
  leave: 'Leave',
  myInfo: 'My Info',
};

// Page heading text used in assertions — centralised to avoid hardcoding in page objects
export const PAGE_HEADINGS = {
  applyLeave: 'Apply Leave',
  employeeInformation: 'Employee Information',
};

// Timeouts used inside Page Object methods — centralised so a single change updates all pages
export const TIMEOUTS = {
  login: 30000,       // Timeout for login page elements (login can be slow on demo site)
  standard: 15000,    // Default wait for elements to become visible
  autocomplete: 1000, // Short pause for autocomplete dropdowns to fetch from server
};
