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
