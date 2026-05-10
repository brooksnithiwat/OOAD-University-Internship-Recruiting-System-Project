import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  ADMIN,
  APP_BASE_URL,
  MOCK_JWT,
  STUDENT,
  VERIFIED_EMPLOYER,
  createLoginResponse,
  mockAuthLoginRoute,
} from './mock.helper';

type LoginTarget = typeof STUDENT | typeof ADMIN | typeof VERIFIED_EMPLOYER;

export const seedAuthSession = async (page: Page, user: LoginTarget, token = MOCK_JWT) => {
  await page.addInitScript(
    ({ sessionUser, sessionToken }) => {
      localStorage.setItem('AUTH_TOKEN', sessionToken);
      localStorage.setItem('USER_ROLE', sessionUser.role);
      localStorage.setItem('USER_ID', sessionUser.userId);
      localStorage.setItem('USER_EMAIL', sessionUser.email);

      if (typeof sessionUser.gpa === 'number') {
        localStorage.setItem('USER_GPA', sessionUser.gpa.toString());
      }
    },
    {
      sessionUser: user,
      sessionToken: token,
    },
  );
};

export const clearAuthSession = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('USER_ROLE');
    localStorage.removeItem('USER_ID');
    localStorage.removeItem('USER_EMAIL');
    localStorage.removeItem('USER_GPA');
  });
};

export const loginWithMockedJwt = async (
  page: Page,
  user: LoginTarget,
  options: { expectedPath?: RegExp; token?: string } = {},
) => {
  const token = options.token ?? MOCK_JWT;

  await mockAuthLoginRoute(page, user, token);
  await page.goto(`${APP_BASE_URL}/login`);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.locator('form').getByRole('button', { name: 'Login' }).click();

  if (options.expectedPath) {
    await expect(page).toHaveURL(options.expectedPath);
  }

  return createLoginResponse(user);
};
