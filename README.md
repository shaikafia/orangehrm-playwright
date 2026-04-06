# OrangeHRM Playwright Test Suite

Playwright automation project for [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com), structured to match enterprise-grade patterns — no hardcoding, multi-environment config, global auth setup, and Page Object Model.

---

## 📁 Project Structure

```
orangehrm-pw/
├── config/
│   ├── testdata.dev.json       # Dev environment test data
│   ├── testdata.stage.json     # Stage environment test data
│   └── testdata.prod.json      # Prod environment test data
├── tests/
│   ├── fixtures/
│   │   └── base.ts             # Custom fixtures (page objects injected)
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── EmployeePage.ts
│   │   └── LeavePage.ts
│   ├── utils/
│   │   └── constants.ts        # Error messages, success messages, URLs
│   ├── global-setup.ts         # Runs once before all tests — saves auth state
│   └── orangehrm.spec.ts       # All test cases
├── scripts/
│   ├── health-check.js         # Checks if site is reachable
│   └── validate-test-data.js   # Validates config JSON files
├── .auth/                      # Auto-generated — stores login session
├── .env.example                # Copy to .env and configure
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Install Playwright browsers
```bash
npx playwright install
```

### 3. Fix TypeScript errors (if any after git clone)
```bash
npm install --save-dev @types/node
```

---

## ▶️ Running Tests

```bash
# Run all tests (dev environment)
npm test

# Run on specific environment
npm run test:dev
npm run test:stage
npm run test:prod

# Run only @smoke tagged tests
npm run test:smoke

# Run in headed mode (see browser)
npm run test:headed

# Open Playwright UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

---

## 🧪 Test Cases

| TC | Description | Tag |
|----|-------------|-----|
| TC-01 | Login with valid credentials | @smoke |
| TC-02 | Error on invalid username | @regression |
| TC-03 | Error on invalid password | @regression |
| TC-04 | Error on both invalid credentials | @regression |
| TC-05 | Error when username empty | @regression |
| TC-06 | Error when password empty | @regression |
| TC-07 | XSS injection handled safely | @regression |
| TC-08 | SQL injection handled safely | @regression |
| TC-09 | Dashboard loads after login | @smoke |
| TC-10 | Logged-in username displayed | @regression |
| TC-11 | Logout successfully | @regression |
| TC-12 | Employee list page loads | @smoke |
| TC-13 | Add Employee form opens | @regression |
| TC-14 | Search employee by name (DDT) | @smoke |
| TC-15 | Employee table has results | @regression |
| TC-16 | Apply Leave page loads | @smoke |
| TC-17 | Leave validation errors show | @regression |
| TC-18 | Leave list page loads | @regression |
| TC-19 | My leave list page loads | @regression |
| TC-20 | Navigate to PIM from sidebar | @smoke |
| TC-21 | Navigate to Leave from sidebar | @regression |
| TC-22 | Navigate to Admin from sidebar | @regression |
| TC-23 | Navigate to My Info page | @regression |
| TC-24 | Screenshot of dashboard | @regression |

---

## 🔧 Utility Scripts

```bash
# Check if OrangeHRM site is reachable
npm run health:check

# Validate all config JSON files
npm run validate:data
```

---

## ⚙️ Environment Config

All test data lives in `config/testdata.<env>.json` — **no hardcoding** in test files.

| Key | Description |
|-----|-------------|
| `baseUrl` | Base URL of the app |
| `credentials` | Login credentials (valid + invalid) |
| `employee` | Employee data for PIM tests |
| `searchProfiles` | Array for data-driven search tests |
| `leaveTypes` | Leave type names |
