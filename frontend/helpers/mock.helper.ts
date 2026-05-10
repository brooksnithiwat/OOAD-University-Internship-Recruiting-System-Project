import type { Page, Route } from '@playwright/test';
import type { AuthResponse } from '../src/types/auth';
import type {
  CreateJobPostResponse,
  JobPostDetail,
  JobPostListResponse,
  JobPostResponse,
} from '../src/services/jobPost.service';

export const STUDENT = {
  email: 'student@test.com',
  password: 'password123',
  role: 'STUDENT' as const,
  gpa: 3.0,
  userId: 'student-1',
};

export const ADMIN = {
  email: 'admin@test.com',
  password: 'password123',
  role: 'SYSTEM_ADMINISTRATOR' as const,
  userId: 'admin-1',
};

export const VERIFIED_EMPLOYER = {
  email: 'employer@test.com',
  password: 'password123',
  role: 'EMPLOYER' as const,
  userId: 'employer-1',
};

export const APP_BASE_URL = 'http://localhost:5173';
export const MOCK_JWT = 'mock-jwt-token';

type MockSessionUser = {
  email: string;
  password: string;
  role: AuthResponse['role'];
  userId: string;
  gpa?: number;
};

type JobFixture = JobPostDetail & {
  companyName: string;
  description: string;
};

type EmployerFixture = {
  employerId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  email: string;
  createdAt: string;
};

export const mockSessionUser = (user: MockSessionUser, token: string = MOCK_JWT): AuthResponse => ({
  accessToken: token,
  role: user.role,
  userId: user.userId,
  email: user.email,
  gpa: user.gpa,
});

export const successResponse = <T,>(body: T, status = 200, statusText = 'OK') => ({
  status,
  statusText,
  body: JSON.stringify(body),
  contentType: 'application/json',
});

export const errorResponse = (
  status: number,
  statusText: string,
  body: Record<string, unknown> = {},
) => ({
  status,
  statusText,
  body: JSON.stringify(body),
  contentType: 'application/json',
});

export const fulfillJson = async <T,>(route: Route, payload: T, status = 200, statusText = 'OK') => {
  await route.fulfill(successResponse(payload, status, statusText));
};

export const createStudentRegisterSuccess = (userId = 'student-created-1') => ({
  message: 'Student registered successfully',
  userId,
});

export const createDuplicateEmailError = () =>
  errorResponse(409, 'Email already exists', {
    message: 'Email already exists',
  });

export const createUnauthorizedError = () =>
  errorResponse(401, 'Invalid credentials', {
    message: 'Invalid credentials',
  });

export const createNotFoundError = () =>
  errorResponse(404, 'User not found', {
    message: 'User not found',
  });

export const createLoginResponse = (user: MockSessionUser): AuthResponse => mockSessionUser(user);

const JOB_FIXTURES: JobFixture[] = [
  {
    jobId: 'job-1',
    title: 'Software Engineer Intern',
    description: 'Build frontend features and collaborate on full-stack internship projects.',
    location: 'Bangkok',
    minGpa: 2.5,
    durationWeeks: 12,
    applicationDeadline: '2026-12-31T00:00:00.000Z',
    status: 'ACTIVE',
    skills: ['React', 'TypeScript', 'Node.js'],
    companyName: 'TechNova',
    employer: {
      companyName: 'TechNova',
      industry: 'Software',
      website: 'https://technova.example',
    },
  },
  {
    jobId: 'job-2',
    title: 'Data Analyst Intern',
    description: 'Analyze product data, build dashboards, and prepare weekly insights.',
    location: 'Chiang Mai',
    minGpa: 3.0,
    durationWeeks: 10,
    applicationDeadline: '2026-11-30T00:00:00.000Z',
    status: 'ACTIVE',
    skills: ['SQL', 'Python', 'Power BI'],
    companyName: 'DataFlow',
    employer: {
      companyName: 'DataFlow',
      industry: 'Analytics',
      website: 'https://dataflow.example',
    },
  },
  {
    jobId: 'job-3',
    title: 'Mobile App Intern',
    description: 'Ship mobile screens and collaborate on product design decisions.',
    location: 'Bangkok',
    minGpa: 3.5,
    durationWeeks: 8,
    applicationDeadline: '2026-10-15T00:00:00.000Z',
    status: 'ACTIVE',
    skills: ['Flutter', 'Dart', 'UI Design'],
    companyName: 'AppVerse',
    employer: {
      companyName: 'AppVerse',
      industry: 'Mobile',
      website: 'https://appverse.example',
    },
  },
  {
    jobId: 'job-4',
    title: 'Backend Engineer Intern',
    description: 'Maintain APIs, design database schemas, and improve application reliability.',
    location: 'Remote',
    minGpa: 2.75,
    durationWeeks: 14,
    applicationDeadline: '2026-09-30T00:00:00.000Z',
    status: 'CLOSED',
    skills: ['NestJS', 'PostgreSQL', 'Docker'],
    companyName: 'CloudLab',
    employer: {
      companyName: 'CloudLab',
      industry: 'Cloud Services',
      website: 'https://cloudlab.example',
    },
  },
];

const DEFAULT_EMPLOYERS: EmployerFixture[] = [
  {
    employerId: 'emp-1',
    companyName: 'TechNova',
    industry: 'Software',
    website: 'https://technova.example',
    contactName: 'Alice Chen',
    contactPhone: '0812345678',
    isVerified: false,
    email: 'hr@technova.example',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    employerId: 'emp-2',
    companyName: 'DataFlow',
    industry: 'Analytics',
    website: 'https://dataflow.example',
    contactName: 'Bob Lee',
    contactPhone: '0823456789',
    isVerified: false,
    email: 'jobs@dataflow.example',
    createdAt: '2026-05-02T00:00:00.000Z',
  },
];

const mapJobToListResponse = (job: JobFixture): JobPostResponse => ({
  jobId: job.jobId,
  title: job.title,
  location: job.location,
  minGpa: job.minGpa,
  durationWeeks: job.durationWeeks,
  applicationDeadline: job.applicationDeadline,
  companyName: job.companyName,
  skills: job.skills,
  status: job.status,
});

export const createJobFixtures = (): JobFixture[] => JOB_FIXTURES.map((job) => ({ ...job }));

export const createJobDetailFixture = (jobId = 'job-1'): JobPostDetail => {
  const job = JOB_FIXTURES.find((item) => item.jobId === jobId) ?? JOB_FIXTURES[0];

  return {
    jobId: job.jobId,
    title: job.title,
    description: job.description,
    location: job.location,
    minGpa: job.minGpa,
    durationWeeks: job.durationWeeks,
    applicationDeadline: job.applicationDeadline,
    status: job.status,
    skills: [...job.skills],
    employer: { ...job.employer },
  };
};

const buildJobListResponse = (jobs: JobFixture[], params: URLSearchParams): JobPostListResponse => {
  const search = params.get('search')?.trim().toLowerCase();
  const location = params.get('location')?.trim().toLowerCase();
  const minGpa = params.get('minGpa');
  const status = params.get('status')?.trim().toUpperCase();
  const showAll = params.get('showAll') === 'true';
  const page = Number(params.get('page') ?? '1') || 1;
  const limit = Number(params.get('limit') ?? '10') || 10;

  const filtered = jobs.filter((job) => {
    if (status) {
      if (job.status !== status) {
        return false;
      }
    } else if (!showAll && job.status !== 'ACTIVE') {
      return false;
    }

    if (search) {
      const haystack = [job.title, job.description, job.companyName, job.location ?? '', ...job.skills]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (location && !(job.location ?? '').toLowerCase().includes(location)) {
      return false;
    }

    if (minGpa !== null && minGpa !== '' && job.minGpa > Number(minGpa)) {
      return false;
    }

    return true;
  });

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end).map(mapJobToListResponse),
    total: filtered.length,
    page,
    limit,
  };
};

export const mockAuthLoginRoute = async (page: Page, user: MockSessionUser, token = MOCK_JWT) => {
  await page.route('**/*auth/login', async (route) => {
    await fulfillJson(route, createLoginResponse(user), 200, 'OK');
  });

  return token;
};

export const mockStudentRegisterRoute = async (
  page: Page,
  options?: { status?: number; statusText?: string; body?: Record<string, unknown> | string; contentType?: string },
) => {
  let status = 201;
  let statusText = 'Created';
  let body: any = createStudentRegisterSuccess();
  let contentType = 'application/json';

  if (options) {
    status = options.status ?? status;
    statusText = options.statusText ?? statusText;
    body = options.body ?? body;
    contentType = options.contentType ?? contentType;
  }

  await page.route('**/*auth/register/student', async (route) => {
    const response = typeof body === 'string' ? body : JSON.stringify(body);
    await route.fulfill({
      status,
      statusText,
      body: response,
      contentType,
    });
  });
};

export const mockJobPostRoutes = async (page: Page, jobs: JobFixture[] = createJobFixtures()) => {
  await page.route('**/*job-posts**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    // GET /job-posts (list)
    if ((pathname === '/job-posts' || pathname.endsWith('/job-posts')) && method === 'GET' && !pathname.split('/').some((p, i) => i > 3)) {
      await fulfillJson(route, buildJobListResponse(jobs, url.searchParams), 200, 'OK');
      return;
    }

    // GET /job-posts/:id (detail)
    const detailMatch = pathname.match(/\/job-posts\/([^/]+)$/);
    if (detailMatch) {
      const jobId = detailMatch[1];
      const job = jobs.find((item) => item.jobId === jobId) ?? jobs[0];

      if (method === 'GET') {
        await fulfillJson(route, createJobDetailFixture(job.jobId), 200, 'OK');
        return;
      }

      if (method === 'PATCH') {
        const payload: Partial<CreateJobPostResponse> = {
          jobId: job.jobId,
          title: job.title,
          status: job.status,
        };
        await fulfillJson(route, payload, 200, 'OK');
        return;
      }

      if (method === 'DELETE') {
        await fulfillJson(route, { message: 'Job post closed successfully' }, 200, 'OK');
        return;
      }
    }

    if ((pathname === '/job-posts' || pathname.endsWith('/job-posts')) && method === 'POST') {
      await fulfillJson(route, { jobId: 'job-created-1', title: 'Created Job', status: 'ACTIVE' }, 201, 'Created');
      return;
    }

    await route.abort('failed');
  });
};

const filterEmployers = (employers: EmployerFixture[], params: URLSearchParams) => {
  const verificationStatus = params.get('verificationStatus') ?? 'UNAPPROVED';
  const search = params.get('search')?.trim().toLowerCase();

  return employers.filter((employer) => {
    if (verificationStatus === 'APPROVED' && !employer.isVerified) {
      return false;
    }

    if (verificationStatus === 'UNAPPROVED' && employer.isVerified) {
      return false;
    }

    if (search) {
      const haystack = [
        employer.email,
        employer.companyName,
        employer.industry ?? '',
        employer.contactName ?? '',
        employer.contactPhone ?? '',
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
};

const mapEmployerToApiItem = (employer: EmployerFixture) => ({
  employerId: employer.employerId,
  companyName: employer.companyName,
  industry: employer.industry,
  website: employer.website,
  contactName: employer.contactName,
  contactPhone: employer.contactPhone,
  isVerified: employer.isVerified,
  user: {
    email: employer.email,
    createdAt: employer.createdAt,
  },
});

export const mockAdminDashboardRoutes = async (
  page: Page,
  options: {
    employers?: EmployerFixture[];
    totalUsers?: number;
    jobs?: JobFixture[];
  } = {},
) => {
  const employers = [...(options.employers ?? DEFAULT_EMPLOYERS)];
  const totalUsers = options.totalUsers ?? 12;
  const jobs = options.jobs ?? createJobFixtures();

  await page.route('**/*admin/employers/unverified', async (route) => {
    const payload = {
      data: employers.filter((employer) => !employer.isVerified).map(mapEmployerToApiItem),
      total: employers.filter((employer) => !employer.isVerified).length,
    };
    await fulfillJson(route, payload, 200, 'OK');
  });

  await page.route('**/*users', async (route) => {
    const users = Array.from({ length: totalUsers }, (_, index) => ({
      userId: `user-${index + 1}`,
      email: `user-${index + 1}@test.com`,
      role: 'STUDENT',
      department: null,
      academicYear: null,
      faculty: null,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    }));

    await fulfillJson(route, users, 200, 'OK');
  });

  await page.route('**/*job-posts**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    if (pathname === '/job-posts' && method === 'GET') {
      await fulfillJson(route, buildJobListResponse(jobs, url.searchParams), 200, 'OK');
      return;
    }

    await route.abort('failed');
  });
};

export const mockEmployerReviewRoutes = async (
  page: Page,
  employers: EmployerFixture[] = [...DEFAULT_EMPLOYERS],
) => {
  const currentEmployers = [...employers];

  await page.route('**/*admin/employers*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    console.log(`[MOCK] ${method} ${pathname}${url.search}`);

    // PATCH /admin/employers/:id/verify (must check first)
    const verifyMatch = pathname.match(/\/admin\/employers\/([^/]+)\/verify$/);
    if (verifyMatch && method === 'PATCH') {
      console.log(`[MOCK] Verifying employer: ${verifyMatch[1]}`);
      const employerId = verifyMatch[1];
      const employer = currentEmployers.find((item) => item.employerId === employerId);

      if (employer) {
        console.log(`[MOCK] Found employer ${employerId}, marking as verified`);
        employer.isVerified = true;
      }

      await fulfillJson(route, { message: 'Employer verified successfully' }, 200, 'OK');
      return;
    }

    // GET /admin/employers/unverified
    if (pathname.endsWith('/admin/employers/unverified') && method === 'GET') {
      const filtered = currentEmployers.filter((employer) => !employer.isVerified);
      const payload = {
        data: filtered.map(mapEmployerToApiItem),
        total: filtered.length,
      };
      await fulfillJson(route, payload, 200, 'OK');
      return;
    }

    // GET /admin/employers (with filters)
    if (pathname.endsWith('/admin/employers') && method === 'GET') {
      const filtered = filterEmployers(currentEmployers, url.searchParams);
      const payload = {
        data: filtered.map(mapEmployerToApiItem),
        total: filtered.length,
      };
      await fulfillJson(route, payload, 200, 'OK');
      return;
    }

    // Let other requests continue to the network (will fail if backend isn't running)
    await route.continue();
  });
};

export const defaultJobFixtures = JOB_FIXTURES.map((job) => ({ ...job }));

export const defaultEmployerFixtures = DEFAULT_EMPLOYERS.map((employer) => ({ ...employer }));
