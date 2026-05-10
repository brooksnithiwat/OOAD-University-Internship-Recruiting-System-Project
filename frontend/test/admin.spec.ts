import { expect, test } from '@playwright/test';
import {
  ADMIN,
  APP_BASE_URL,
  STUDENT,
  defaultEmployerFixtures,
  defaultJobFixtures,
  mockAdminDashboardRoutes,
  mockEmployerReviewRoutes,
} from '../helpers/mock.helper';
import { loginWithMockedJwt, seedAuthSession } from '../helpers/auth.helper';

test.describe('Admin flows', () => {
  test('admin login redirects to admin dashboard', async ({ page }) => {
    await mockAdminDashboardRoutes(page, {
      employers: defaultEmployerFixtures,
      totalUsers: 18,
      jobs: defaultJobFixtures,
    });

    await loginWithMockedJwt(page, ADMIN, { expectedPath: /\/admin$/ });
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('admin dashboard shows unverified employer count and review link', async ({ page }) => {
    await seedAuthSession(page, ADMIN);
    await mockAdminDashboardRoutes(page, {
      employers: defaultEmployerFixtures,
      totalUsers: 18,
      jobs: defaultJobFixtures,
    });

    await page.goto(`${APP_BASE_URL}/admin`);

    await expect(page.getByRole('link', { name: /Employers awaiting verification/i })).toContainText('2');
    await expect(page.getByRole('link', { name: /Unverified Employers/i })).toBeVisible();
  });

  test('unverified employers page shows empty state when no employers remain', async ({ page }) => {
    await seedAuthSession(page, ADMIN);
    await mockEmployerReviewRoutes(page, []);

    await page.goto(`${APP_BASE_URL}/admin/employers/unverified`);

    await expect(page.getByText('No employers waiting for verification')).toBeVisible();
    await expect(page.getByText('All employer registrations have been reviewed.')).toBeVisible();
  });

  test('student is redirected away from admin pages', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockAdminDashboardRoutes(page, {
      employers: defaultEmployerFixtures,
      totalUsers: 18,
      jobs: defaultJobFixtures,
    });

    await page.goto(`${APP_BASE_URL}/admin`);

    await expect(page).toHaveURL(/\/jobs$/);
  });
});
