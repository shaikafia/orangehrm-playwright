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

export const TEST_PAYLOADS = {
  xss: '<script>alert("xss")</script>',
  sql: "' OR '1'='1",
};

export const NAV_LABELS = {
  apply: 'Apply',
  employeeList: 'Employee List',
  firstName: 'First Name',
  dashboard: 'Dashboard',
  pim: 'PIM',
  leave: 'Leave',
  myInfo: 'My Info',
  login: 'Login',      
  logout: 'Logout',    
  add: 'Add',          
  save: 'Save',        
  search: 'Search',    
};

export const PAGE_HEADINGS = {
  applyLeave: 'Apply Leave',
  employeeInformation: 'Employee Information',
};

export const AUTH_CONFIG = {
  dir: '.auth',
  file: 'user.json',
  path: '.auth/user.json',
};

export const PLACEHOLDERS = {
  username: 'Username',
  password: 'Password',
};

export const SELECTORS = {
  topbarHeader:      '.oxd-topbar-header',
  tableFilter:       '.oxd-table-filter',
  tableBody:         '.oxd-table-body',
  tableRow:          '.oxd-table-row--with-border',
  successToast:      '.oxd-toast-content--success',
  errorToast:        '.oxd-toast-content--error',
  userDropdown:      '.oxd-userdropdown-tab',
  userDropdownName:  '.oxd-userdropdown-name',
  alertText:         '.oxd-alert-content-text',
  fieldError:        '.oxd-input-field-error-message',
  leaveTypeDropdown: '.oxd-select-text',
  autocompleteInput: '.oxd-autocomplete-text-input input',
  dateInput:         '.oxd-date-input input',
  inputField:        '.oxd-input',
  firstNameInput:    'input[name="firstName"]',
  lastNameInput:     'input[name="lastName"]',
};

export const SCREENSHOT_PATHS = {
  dashboard: 'test-results/screenshots/dashboard.png',
};

export const TIMEOUTS = {
  login: 30000,
  navigation: 60000,
  standard: 15000,
  autocomplete: 1000,
};