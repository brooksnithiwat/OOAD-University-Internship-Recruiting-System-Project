import { Test, TestingModule } from '@nestjs/testing';
import { JobPostsService } from '../src/job-posts/job-posts.service';
import { JobPostsRepository } from '../src/job-posts/job-posts.repository';
import { PrismaService } from '../src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Mock data
const mockJobPost = {
  jobId: 'job-uuid-1',
  title: 'Software Engineer Intern',
  description: 'Join our team and build great things',
  location: 'Bangkok',
  minGpa: 2.5,
  durationWeeks: 16,
  applicationDeadline: '2026-12-31',
  status: 'ACTIVE',
  skills: ['JavaScript', 'NestJS'],
  employer: {
    companyName: 'Acme Corp',
    industry: 'Technology',
    website: 'https://acme.com',
  },
};

const mockJobPostDetail = {
  jobId: 'job-uuid-1',
  title: 'Software Engineer Intern',
  description: 'Join our team and build great things',
  location: 'Bangkok',
  minGpa: 2.5,
  durationWeeks: 16,
  applicationDeadline: '2026-12-31',
  status: 'ACTIVE',
  skills: ['JavaScript', 'NestJS'],
  employer: {
    companyName: 'Acme Corp',
    industry: 'Technology',
    website: 'https://acme.com',
  },
};

const mockEmployer = {
  employerId: 'employer-uuid-1',
  isVerified: true,
};

const mockSearchResult = {
  data: [
    {
      jobId: 'job-uuid-1',
      title: 'Software Engineer Intern',
      location: 'Bangkok',
      minGpa: 2.5,
      durationWeeks: 16,
      applicationDeadline: '2026-12-31',
      companyName: 'Acme Corp',
      skills: ['JavaScript', 'NestJS'],
      status: 'ACTIVE',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
};

describe('JobPostsService', () => {
  let service: JobPostsService;

  const mockJobPostsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    close: jest.fn(),
    findByIdAndEmployerId: jest.fn(),
  };

  const mockPrismaService = {
    employer: {
      findUnique: jest.fn(),
    },
    jobPost: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostsService,
        { provide: JobPostsRepository, useValue: mockJobPostsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<JobPostsService>(JobPostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createJobPost()', () => {
    it('should create job post and return { jobId, title, status }', async () => {
      const createDto = {
        title: 'Software Engineer Intern',
        description: 'Join our team and build great things',
        location: 'Bangkok',
        minGpa: 2.5,
        durationWeeks: 16,
        applicationDeadline: '2026-12-31',
        skills: ['JavaScript', 'NestJS'],
      };

      mockPrismaService.employer.findUnique.mockResolvedValue(mockEmployer);
      mockJobPostsRepository.create.mockResolvedValue({
        jobId: 'job-uuid-1',
        title: 'Software Engineer Intern',
        status: 'ACTIVE',
      });

      const result = await service.createJobPost(createDto, 'user-uuid-2');

      expect(result).toEqual({
        jobId: 'job-uuid-1',
        title: 'Software Engineer Intern',
        status: 'ACTIVE',
      });
      expect(mockJobPostsRepository.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when employer isVerified = false', async () => {
      const createDto = {
        title: 'Software Engineer Intern',
        description: 'Join our team and build great things',
        location: 'Bangkok',
        minGpa: 2.5,
        durationWeeks: 16,
        applicationDeadline: '2026-12-31',
        skills: ['JavaScript', 'NestJS'],
      };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
        isVerified: false,
      });

      await expect(service.createJobPost(createDto, 'user-uuid-2')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw ForbiddenException when application deadline is past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const createDto = {
        title: 'Software Engineer Intern',
        description: 'Join our team and build great things',
        location: 'Bangkok',
        minGpa: 2.5,
        durationWeeks: 16,
        applicationDeadline: pastDate.toISOString().split('T')[0],
        skills: ['JavaScript', 'NestJS'],
      };

      mockPrismaService.employer.findUnique.mockResolvedValue(mockEmployer);

      await expect(service.createJobPost(createDto, 'user-uuid-2')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when employer not found', async () => {
      const createDto = {
        title: 'Software Engineer Intern',
        description: 'Join our team and build great things',
        location: 'Bangkok',
        minGpa: 2.5,
        durationWeeks: 16,
        applicationDeadline: '2026-12-31',
        skills: ['JavaScript', 'NestJS'],
      };

      mockPrismaService.employer.findUnique.mockResolvedValue(null);

      await expect(service.createJobPost(createDto, 'user-uuid-2')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getJobPosts()', () => {
    it('should return paginated result { data, total, page, limit }', async () => {
      const filters = { page: 1, limit: 10 };

      mockJobPostsRepository.findAll.mockResolvedValue(mockSearchResult);

      const result = await service.getJobPosts(filters);

      expect(result).toEqual(mockSearchResult);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('should pass filters (location, minGpa, search) to repository', async () => {
      const filters = {
        page: 1,
        limit: 10,
        location: 'Bangkok',
        minGpa: 3.0,
        search: 'Engineer',
      };

      mockJobPostsRepository.findAll.mockResolvedValue(mockSearchResult);

      await service.getJobPosts(filters);

      expect(mockJobPostsRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty data array when no jobs found', async () => {
      const filters = { page: 1, limit: 10 };
      const emptyResult = { data: [], total: 0, page: 1, limit: 10 };

      mockJobPostsRepository.findAll.mockResolvedValue(emptyResult);

      const result = await service.getJobPosts(filters);

      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getJobPostDetail()', () => {
    it('should return job detail with skills and employer info', async () => {
      mockJobPostsRepository.findById.mockResolvedValue(mockJobPostDetail);

      const result = await service.getJobPostDetail('job-uuid-1');

      expect(result).toEqual(
        expect.objectContaining({
          jobId: 'job-uuid-1',
          title: 'Software Engineer Intern',
          skills: expect.arrayContaining(['JavaScript', 'NestJS']),
          employer: expect.objectContaining({
            companyName: 'Acme Corp',
            industry: 'Technology',
          }),
        })
      );
    });

    it('should throw NotFoundException when job not found', async () => {
      mockJobPostsRepository.findById.mockResolvedValue(null);

      await expect(service.getJobPostDetail('nonexistent-job')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include minGpa in response', async () => {
      mockJobPostsRepository.findById.mockResolvedValue(mockJobPostDetail);

      const result = await service.getJobPostDetail('job-uuid-1');

      expect(result).toHaveProperty('minGpa', 2.5);
    });

    it('should include durationWeeks in response', async () => {
      mockJobPostsRepository.findById.mockResolvedValue(mockJobPostDetail);

      const result = await service.getJobPostDetail('job-uuid-1');

      expect(result).toHaveProperty('durationWeeks', 16);
    });
  });

  describe('updateJobPost()', () => {
    it('should update and return job when called by owner', async () => {
      const updateDto = { title: 'Updated Title' };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockPrismaService.jobPost.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockJobPostsRepository.update.mockResolvedValue({
        jobId: 'job-uuid-1',
        title: 'Updated Title',
        status: 'ACTIVE',
      });

      const result = await service.updateJobPost('job-uuid-1', updateDto, 'user-uuid-2');

      expect(result).toEqual({
        jobId: 'job-uuid-1',
        title: 'Updated Title',
        status: 'ACTIVE',
      });
      expect(mockJobPostsRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when job not found', async () => {
      const updateDto = { title: 'Updated Title' };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue(null);

      await expect(
        service.updateJobPost('nonexistent-job', updateDto, 'user-uuid-2')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when caller is not owner', async () => {
      const updateDto = { title: 'Updated Title' };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'different-employer-uuid',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue(null);

      await expect(
        service.updateJobPost('job-uuid-1', updateDto, 'user-uuid-2')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when job is CLOSED', async () => {
      const updateDto = { title: 'Updated Title' };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue({
        status: 'CLOSED',
      });
      mockPrismaService.jobPost.findUnique.mockResolvedValue({
        status: 'CLOSED',
      });

      await expect(
        service.updateJobPost('job-uuid-1', updateDto, 'user-uuid-2')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate application deadline if provided', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const updateDto = {
        title: 'Updated Title',
        applicationDeadline: pastDate.toISOString().split('T')[0],
      };

      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue({
        status: 'ACTIVE',
      });

      await expect(
        service.updateJobPost('job-uuid-1', updateDto, 'user-uuid-2')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('closeJobPost()', () => {
    it('should set status CLOSED and return on success', async () => {
      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockPrismaService.jobPost.findUnique.mockResolvedValue({
        status: 'ACTIVE',
      });
      mockJobPostsRepository.close.mockResolvedValue(undefined);

      await service.closeJobPost('job-uuid-1', 'user-uuid-2');

      expect(mockJobPostsRepository.close).toHaveBeenCalledWith('job-uuid-1');
    });

    it('should throw NotFoundException when job not found', async () => {
      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue(null);

      await expect(service.closeJobPost('nonexistent-job', 'user-uuid-2')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw ForbiddenException when caller is not owner', async () => {
      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'different-employer-uuid',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue(null);

      await expect(service.closeJobPost('job-uuid-1', 'user-uuid-2')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw ForbiddenException when job is already CLOSED', async () => {
      mockPrismaService.employer.findUnique.mockResolvedValue({
        employerId: 'employer-uuid-1',
      });
      mockJobPostsRepository.findByIdAndEmployerId.mockResolvedValue({
        status: 'CLOSED',
      });
      mockPrismaService.jobPost.findUnique.mockResolvedValue({
        status: 'CLOSED',
      });

      await expect(service.closeJobPost('job-uuid-1', 'user-uuid-2')).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});