import { expect, test } from '@playwright/test';
import {
  APP_BASE_URL,
  VERIFIED_EMPLOYER,
  STUDENT,
  createJobFixtures,
  fulfillJson,
  mockJobPostRoutes,
} from '../helpers/mock.helper';
import { seedAuthSession } from '../helpers/auth.helper';

test.describe('Job posts flows', () => {
  test('job board renders cards from mocked API', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);

    await expect(page.getByRole('heading', { name: 'Job Board' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Software Engineer Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Analyst Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mobile App Intern' })).toBeVisible();
  });

  test('create job post errors show the backend message', async ({ page }) => {
    await seedAuthSession(page, VERIFIED_EMPLOYER);

    await page.route('**/*job-posts**', async (route) => {
      if (route.request().method() === 'POST') {
        await fulfillJson(route, {
          message: 'Employer must be verified to create job posts',
          error: 'Forbidden',
          statusCode: 403,
        }, 403);
        return;
      }

      await route.abort('failed');
    });

    await page.goto(`${APP_BASE_URL}/jobs/create`);
    await page.getByLabel('Title *').fill('Backend Intern');
    await page.getByLabel('Description *').fill('Build and maintain internship backend features.');
    await page.getByLabel('Location').fill('Bangkok');
    await page.getByLabel('Min GPA').fill('3.00');
    await page.getByLabel('Duration (weeks) *').fill('12');
    await page.locator('input[type="date"]').fill('2026-12-31');
    await page.getByPlaceholder('Type a skill and press Enter...').fill('Node.js');
    await page.getByPlaceholder('Type a skill and press Enter...').press('Enter');

    await page.locator('form').getByRole('button', { name: 'Create Job Post' }).click();

    await expect(page.getByText('Employer must be verified to create job posts')).toBeVisible();
  });

  test('employer does not see the my GPA filter', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, VERIFIED_EMPLOYER);

    await page.goto(`${APP_BASE_URL}/jobs`);

    await expect(page.getByRole('checkbox', { name: /My GPA/i })).toHaveCount(0);
  });

  test('search filters jobs by keyword', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);
    await page.getByLabel('Search').fill('Data');

    await expect(page.getByRole('heading', { name: 'Data Analyst Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Software Engineer Intern' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Mobile App Intern' })).toHaveCount(0);
  });

  test('location filter returns matching jobs only', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);
    await page.getByLabel('Location').fill('Bangkok');

    await expect(page.getByRole('heading', { name: 'Software Engineer Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mobile App Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Analyst Intern' })).toHaveCount(0);
  });

  test('my GPA filter hides jobs above student GPA', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);
    await page.getByLabel('My GPA (3.00)').check();

    await expect(page.getByRole('heading', { name: 'Software Engineer Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Analyst Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mobile App Intern' })).toHaveCount(0);
  });

  test('clearing filters restores the full job list', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);
    await page.getByLabel('Search').fill('Data');
    await page.getByLabel('Location').fill('Chiang Mai');
    await page.getByLabel('My GPA (3.00)').check();

    await page.getByLabel('Search').fill('');
    await page.getByLabel('Location').fill('');
    await page.getByLabel('My GPA (3.00)').uncheck();

    await expect(page.getByRole('heading', { name: 'Software Engineer Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Analyst Intern' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mobile App Intern' })).toBeVisible();
  });

  test('empty response shows empty state', async ({ page }) => {
    await mockJobPostRoutes(page, []);
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs`);

    await expect(page.getByRole('heading', { name: 'No jobs found' })).toBeVisible();
    await expect(page.getByText('Try adjusting your filters or check back later for new opportunities.')).toBeVisible();
  });

  test('student above minimum GPA does not see warning banner', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, { ...STUDENT, gpa: 3.8 });

    await page.goto(`${APP_BASE_URL}/jobs/job-3`);

    await expect(page.getByText('below the requirement')).toHaveCount(0);
  });

  test('student cannot see edit or close buttons on job detail', async ({ page }) => {
    await mockJobPostRoutes(page, createJobFixtures());
    await seedAuthSession(page, STUDENT);

    await page.goto(`${APP_BASE_URL}/jobs/job-1`);

    await expect(page.getByRole('button', { name: 'Edit Job Post' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Close Job Post' })).toHaveCount(0);
  });
});
