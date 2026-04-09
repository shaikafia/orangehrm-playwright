import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeePage } from '../pages/EmployeePage';
import { LeavePage } from '../pages/LeavePage';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  leavePage: LeavePage;
};

export const test = base.extend<MyFixtures>({
  page: async ({ page }, use) => {

    await page.addInitScript(`
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.setAttribute('data-test', 'disable-animations');
        style.innerHTML = \`
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
        \`;
        document.head.appendChild(style);
      }
    `);
    await use(page);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  employeePage: async ({ page }, use) => {
    await use(new EmployeePage(page));
  },
  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },
});
