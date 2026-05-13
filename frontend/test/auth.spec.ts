import { expect, test } from '@playwright/test';
import {
  ADMIN,
  APP_BASE_URL,
  STUDENT,
  createDuplicateEmailError,
  createNotFoundError,
  createUnauthorizedError,
  defaultJobFixtures,
  defaultEmployerFixtures,
  mockAdminDashboardRoutes,
  mockJobPostRoutes,
  mockStudentRegisterRoute,
} from '../helpers/mock.helper';
import { loginWithMockedJwt, seedAuthSession } from '../helpers/auth.helper';

test.describe('Auth flows', () => {
  test('student register success shows confirmation and returns to login', async ({ page }) => {
    await mockStudentRegisterRoute(page);
    await page.goto(`${APP_BASE_URL}/register`);

    await page.getByLabel('Student Code').fill('66070503410');
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Faculty').fill('Engineering');
    await page.getByLabel('Department').fill('Computer Science');
    await page.getByLabel('Academic Year').fill('3');
    await page.getByLabel('GPA').fill('3.20');
    await page.getByLabel('Email Address').fill('student-new@test.com');
    await page.getByLabel('Password').first().fill('Password_123');
    await page.getByLabel('Confirm Password').fill('Password_123');

    await page.getByRole('button', { name: 'Register as Student' }).click();

    await expect(page.getByRole('heading', { name: 'Student Registration Successful' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('student register duplicate email shows backend error', async ({ page }) => {
    await mockStudentRegisterRoute(page, createDuplicateEmailError());
    await page.goto(`${APP_BASE_URL}/register`);

    
    await page.getByLabel('Student Code').fill('66070503410');
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Faculty').fill('Engineering');
    await page.getByLabel('Department').fill('Computer Science');
    await page.getByLabel('Academic Year').fill('3');
    await page.getByLabel('GPA').fill('3.20');
    await page.getByLabel('Email Address').fill('student@test.com');
    await page.getByLabel('Password').first().fill('Password_123');
    await page.getByLabel('Confirm Password').fill('Password_123');

    await page.getByRole('button', { name: 'Register as Student' }).click();

    await expect(page.getByText('Email already exists')).toBeVisible();
  });

  test('student register empty submission shows validation errors', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/register`);
    await page.getByRole('button', { name: 'Register as Student' }).click();

    await expect(page.getByText('Student code is required')).toBeVisible();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('student login redirects to jobs', async ({ page }) => {
    await mockJobPostRoutes(page, defaultJobFixtures);
    await loginWithMockedJwt(page, STUDENT, { expectedPath: /\/jobs$/ });

    await expect(page.getByRole('heading', { name: 'Job Board' })).toBeVisible();
  });

  test('admin login redirects to admin dashboard', async ({ page }) => {
    await mockAdminDashboardRoutes(page, {
      employers: defaultEmployerFixtures,
      totalUsers: 18,
      jobs: defaultJobFixtures,
    });

    await loginWithMockedJwt(page, ADMIN, { expectedPath: /\/admin$/ });
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('login with wrong password shows error message', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      const response = createUnauthorizedError();
      await route.fulfill(response);
    });

    await page.goto(`${APP_BASE_URL}/login`);
    await page.getByLabel('Email').fill(STUDENT.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.locator('form').getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login with unregistered email shows not found error', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      const response = createNotFoundError();
      await route.fulfill(response);
    });

    await page.goto(`${APP_BASE_URL}/login`);
    await page.getByLabel('Email').fill('unknown@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.locator('form').getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('User not found')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('visiting jobs without login redirects to login', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/jobs`);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('visiting job create without login redirects to login', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/jobs/create`);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('visiting admin without login redirects to login', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/admin`);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logout clears session and returns to login', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockJobPostRoutes(page, defaultJobFixtures);
    await page.goto(`${APP_BASE_URL}/jobs`);
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('student cannot access admin dashboard', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockAdminDashboardRoutes(page, {
      employers: defaultEmployerFixtures,
      totalUsers: 18,
      jobs: defaultJobFixtures,
    });

    await page.goto(`${APP_BASE_URL}/admin`);

    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.getByRole('heading', { name: 'Job Board' })).toBeVisible();
  });

  test('student is blocked from job create page', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await page.goto(`${APP_BASE_URL}/jobs/create`);

    await expect(page.getByText('Only employers can create job posts.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to Job Board' })).toBeVisible();
  });
});
