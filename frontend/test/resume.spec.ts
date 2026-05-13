import { expect, test } from '@playwright/test';
import { APP_BASE_URL, STUDENT } from '../helpers/mock.helper';
import { seedAuthSession } from '../helpers/auth.helper';

type ResumeItem = {
  resumeId: string;
  studentId: string;
  fileName: string;
  fileRef: string;
  fileSizeBytes: number;
  mimeType: string;
  virusScanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  uploadedAt: string;
};

const createResumeFixtures = (): ResumeItem[] => [
  {
    resumeId: 'resume-1',
    studentId: 'student-1',
    fileName: 'resume.pdf',
    fileRef: 'uploads/resume.pdf',
    fileSizeBytes: 204800,
    mimeType: 'application/pdf',
    virusScanStatus: 'CLEAN',
    uploadedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    resumeId: 'resume-2',
    studentId: 'student-1',
    fileName: 'cv-latest.pdf',
    fileRef: 'uploads/cv-latest.pdf',
    fileSizeBytes: 102400,
    mimeType: 'application/pdf',
    virusScanStatus: 'PENDING',
    uploadedAt: '2026-04-05T00:00:00.000Z',
  },
];

const mockResumeRoutes = async (page: any, initial: ResumeItem[]) => {
  const resumes: ResumeItem[] = [...initial];

  await page.route((url: URL) => url.pathname === '/resumes', async (route: any) => {
    if (route.request().method() === 'GET' && route.request().resourceType() !== 'document') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(resumes),
      });
      return;
    }

    await route.fallback();
  });

  await page.route((url: URL) => url.pathname.startsWith('/resumes/'), async (route: any) => {
    if (route.request().method() === 'DELETE' && route.request().resourceType() !== 'document') {
      const id = route.request().url().split('/').pop();
      const index = resumes.findIndex((r) => r.resumeId === id);

      if (index === -1) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Resume not found' }),
        });
        return;
      }

      resumes.splice(index, 1);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Resume deleted successfully' }),
      });
      return;
    }

    await route.fallback();
  });
};

test.describe('Resume flows', () => {
  test('student can open resumes page and see uploaded files', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockResumeRoutes(page, createResumeFixtures());

    await page.goto(`${APP_BASE_URL}/profile/resumes`);

    await expect(page.getByRole('heading', { name: 'Your Resumes' })).toBeVisible();
    await expect(page.getByText('resume.pdf')).toBeVisible();
    await expect(page.getByText('cv-latest.pdf')).toBeVisible();
    await expect(page.getByText('Ready')).toBeVisible();
    await expect(page.getByText('Scanning...')).toBeVisible();
  });

  test('empty state is shown when no resumes exist', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockResumeRoutes(page, []);

    await page.goto(`${APP_BASE_URL}/profile/resumes`);

    await expect(page.getByText('No resumes uploaded yet. Upload your first resume above.')).toBeVisible();
  });

  test('student can delete own resume from list', async ({ page }) => {
    await seedAuthSession(page, STUDENT);
    await mockResumeRoutes(page, createResumeFixtures());

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.goto(`${APP_BASE_URL}/profile/resumes`);

    await expect(page.getByText('resume.pdf')).toBeVisible();

    const resumeRow = page
      .locator('div.flex.items-center.justify-between.p-4.border.rounded')
      .filter({ has: page.locator('div.font-medium', { hasText: 'resume.pdf' }) });

    await resumeRow.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('resume.pdf')).toHaveCount(0);
    await expect(page.getByText('cv-latest.pdf')).toBeVisible();
  });
});
