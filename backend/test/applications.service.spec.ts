import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../src/applications/applications.service';
import { ApplicationsRepository } from '../src/applications/applications.repository';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ForbiddenException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationStatusEnum } from '../src/applications/dto/update-status.dto';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: jest.Mocked<ApplicationsRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockStudent = {
    studentId: 'student-1',
    userId: 'user-1',
    firstName: 'Supakrit',
    lastName: 'Jirachai',
    gpa: 3.45,
    faculty: 'Engineering',
    eligibilityStatus: 'ELIGIBLE',
    user: {
      userId: 'user-1',
      email: 'student@university.edu',
    },
  };

  const mockJobPost = {
    jobId: 'job-1',
    title: 'Software Engineer Intern',
    companyName: 'Acme Corp',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    employerId: 'employer-1',
    employer: {
      employerId: 'employer-1',
      email: 'employer@acme.com',
      companyName: 'Acme Corp',
      user: {
        userId: 'user-employer-1',
        email: 'employer@acme.com',
      },
    },
  };

  const mockApplication = {
    applicationId: 'app-1',
    studentId: 'student-1',
    jobId: 'job-1',
    status: ApplicationStatus.PENDING,
    submittedAt: new Date(),
    updatedAt: new Date(),
    student: mockStudent,
    jobPost: mockJobPost,
    auditLogs: [],
    resume: null,
  };

  beforeEach(async () => {
    const mockRepositoryProvider = {
      provide: ApplicationsRepository,
      useValue: {
        findStudentByUserId: jest.fn(),
        findStudent: jest.fn(),
        findJobPost: jest.fn(),
        findApplicationByStudentAndJob: jest.fn(),
        createApplicationWithNotification: jest.fn(),
        findApplicationById: jest.fn(),
        updateApplicationStatus: jest.fn(),
        findApplicationsByStudent: jest.fn(),
        findApplicationsByJobPost: jest.fn(),
        findUser: jest.fn(),
        createAuditLog: jest.fn(),
        updateStatusWithAuditAndWithdrawal: jest.fn(),
        findApplicationsByStudentAndStatuses: jest.fn(),
      },
    };

    const mockNotificationsProvider = {
      provide: NotificationsService,
      useValue: {
        sendNewApplicationEmail: jest.fn(),
        sendStatusUpdateEmail: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationsService, mockRepositoryProvider, mockNotificationsProvider],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get(ApplicationsRepository) as jest.Mocked<ApplicationsRepository>;
    notificationsService = module.get(NotificationsService) as jest.Mocked<NotificationsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitApplication', () => {
    it('should create application when student is eligible and job is open', async () => {
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.findJobPost.mockResolvedValue(mockJobPost as any);
      repository.findApplicationByStudentAndJob.mockResolvedValue(null);
      repository.createApplicationWithNotification.mockImplementation(
        async (_studentId, _jobId, _resumeId, callback) => {
          await callback(mockApplication as any);
          return mockApplication as any;
        },
      );

      const result = await service.submitApplication('user-1', {
        jobId: 'job-1',
      });

      expect(result.applicationId).toBe('app-1');
      expect(result.status).toBe(ApplicationStatus.PENDING);
      expect(repository.findStudentByUserId).toHaveBeenCalledWith('user-1');
      expect(repository.findJobPost).toHaveBeenCalledWith('job-1');
      expect(repository.findApplicationByStudentAndJob).toHaveBeenCalledWith('student-1', 'job-1');
      expect(repository.createApplicationWithNotification).toHaveBeenCalledWith(
        'student-1',
        'job-1',
        undefined,
        expect.any(Function),
      );
      expect(notificationsService.sendNewApplicationEmail).toHaveBeenCalledWith(
        'employer@acme.com',
        'Software Engineer Intern',
        'Supakrit Jirachai',
      );
    });

    it('should throw ForbiddenException when student eligibilityStatus is PENDING', async () => {
      const ineligibleStudent = { ...mockStudent, eligibilityStatus: 'PENDING' };
      repository.findStudentByUserId.mockResolvedValue(ineligibleStudent as any);

      await expect(
        service.submitApplication('user-1', { jobId: 'job-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when applicationDeadline has passed', async () => {
      const pastJobPost = {
        ...mockJobPost,
        applicationDeadline: new Date(Date.now() - 1000), // 1 second in the past
      };

      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.findJobPost.mockResolvedValue(pastJobPost as any);

      await expect(
        service.submitApplication('user-1', { jobId: 'job-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when student already applied to same job', async () => {
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.findJobPost.mockResolvedValue(mockJobPost as any);
      repository.findApplicationByStudentAndJob.mockResolvedValue(mockApplication as any);

      await expect(
        service.submitApplication('user-1', { jobId: 'job-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should call NotificationService.sendNewApplicationEmail after successful submission', async () => {
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.findJobPost.mockResolvedValue(mockJobPost as any);
      repository.findApplicationByStudentAndJob.mockResolvedValue(null);
      repository.createApplicationWithNotification.mockImplementation(
        async (_studentId, _jobId, _resumeId, callback) => {
          await callback(mockApplication as any);
          return mockApplication as any;
        },
      );

      await service.submitApplication('user-1', { jobId: 'job-1' });

      expect(notificationsService.sendNewApplicationEmail).toHaveBeenCalledWith(
        'employer@acme.com',
        'Software Engineer Intern',
        'Supakrit Jirachai',
      );
    });
  });

  describe('getMyApplications', () => {
    it('should return only applications belonging to logged-in student', async () => {
      const studentApplications = [
        mockApplication,
        { ...mockApplication, applicationId: 'app-2', jobId: 'job-2' },
      ];

      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.findApplicationsByStudent.mockResolvedValue(studentApplications as any);

      const result = await service.getMyApplications('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].applicationId).toBe('app-1');
      expect(result[0].status).toBe(ApplicationStatus.PENDING);
      expect(repository.findStudentByUserId).toHaveBeenCalledWith('user-1');
      expect(repository.findApplicationsByStudent).toHaveBeenCalledWith('student-1');
    });
  });

  describe('withdrawApplication', () => {
    it('should set status to WITHDRAWN when current status is PENDING', async () => {
      const withdrawnApp = { ...mockApplication, status: ApplicationStatus.WITHDRAWN };
      repository.findApplicationById.mockResolvedValue(mockApplication as any);
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);
      repository.updateApplicationStatus.mockResolvedValue(withdrawnApp as any);

      const result = await service.withdrawApplication('app-1', 'user-1');

      expect(result.message).toBe('Application withdrawn successfully');
      expect(repository.updateApplicationStatus).toHaveBeenCalledWith(
        'app-1',
        ApplicationStatus.WITHDRAWN,
      );
    });

    it('should throw BadRequestException when status is OFFER_SENT', async () => {
      const offerApp = { ...mockApplication, status: ApplicationStatus.OFFER_SENT };
      repository.findApplicationById.mockResolvedValue(offerApp as any);
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);

      await expect(
        service.withdrawApplication('app-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when status is ACCEPTED', async () => {
      const acceptedApp = { ...mockApplication, status: ApplicationStatus.ACCEPTED };
      repository.findApplicationById.mockResolvedValue(acceptedApp as any);
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);

      await expect(
        service.withdrawApplication('app-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when application belongs to another student', async () => {
      const otherStudentApp = { ...mockApplication, studentId: 'student-2' };
      repository.findApplicationById.mockResolvedValue(otherStudentApp as any);
      repository.findStudentByUserId.mockResolvedValue(mockStudent as any);

      await expect(
        service.withdrawApplication('app-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update status and create AuditLog when transition is valid', async () => {
      const updatedApp = {
        ...mockApplication,
        status: ApplicationStatus.INTERVIEW_REQUEST,
      };

      repository.findApplicationById.mockResolvedValue(mockApplication as any);
      repository.findUser.mockResolvedValue({ userId: 'employer-1', email: 'employer@acme.com' } as any);
      repository.updateStatusWithAuditAndWithdrawal.mockResolvedValue(updatedApp as any);
      repository.findStudent.mockResolvedValue(mockStudent as any);

      const result = await service.updateApplicationStatus(
        'app-1',
        'employer-1',
        'user-1',
        { status: ApplicationStatusEnum.INTERVIEW_REQUEST },
      );

      expect(result.oldStatus).toBe(ApplicationStatus.PENDING);
      expect(result.newStatus).toBe(ApplicationStatus.INTERVIEW_REQUEST);
      expect(notificationsService.sendStatusUpdateEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException when transition is invalid (REJECTED to INTERVIEW_REQUEST)', async () => {
      const rejectedApp = { ...mockApplication, status: ApplicationStatus.REJECTED };
      repository.findApplicationById.mockResolvedValue(rejectedApp as any);

      await expect(
        service.updateApplicationStatus('app-1', 'employer-1', 'user-1', {
          status: ApplicationStatusEnum.INTERVIEW_REQUEST,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transition is invalid (ACCEPTED to REJECTED)', async () => {
      const acceptedApp = { ...mockApplication, status: ApplicationStatus.ACCEPTED };
      repository.findApplicationById.mockResolvedValue(acceptedApp as any);

      await expect(
        service.updateApplicationStatus('app-1', 'employer-1', 'user-1', {
          status: ApplicationStatusEnum.REJECTED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when employer does not own the job post', async () => {
      const wrongEmployerApp = {
        ...mockApplication,
        jobPost: { ...mockJobPost, employerId: 'different-employer' },
      };

      repository.findApplicationById.mockResolvedValue(wrongEmployerApp as any);

      await expect(
        service.updateApplicationStatus('app-1', 'employer-1', 'user-1', {
          status: ApplicationStatusEnum.INTERVIEW_REQUEST,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should auto-withdraw other PENDING applications when status changes to ACCEPTED', async () => {
      const acceptedApp = {
        ...mockApplication,
        status: ApplicationStatus.ACCEPTED,
      };

      const offerSentApp = {
        ...mockApplication,
        status: ApplicationStatus.OFFER_SENT,
      };

      const otherPendingApps = [
        { ...mockApplication, applicationId: 'app-2', jobId: 'job-2', status: ApplicationStatus.PENDING },
      ];

      repository.findApplicationById.mockResolvedValue(offerSentApp as any);
      repository.findUser.mockResolvedValue({ userId: 'employer-1' } as any);
      repository.findApplicationsByStudentAndStatuses.mockResolvedValue(otherPendingApps as any);
      repository.updateStatusWithAuditAndWithdrawal.mockResolvedValue(acceptedApp as any);
      repository.updateApplicationStatus.mockResolvedValue({ ...mockApplication, status: ApplicationStatus.WITHDRAWN } as any);
      repository.createAuditLog.mockResolvedValue({} as any);
      repository.findStudent.mockResolvedValue(mockStudent as any);

      await service.updateApplicationStatus('app-1', 'employer-1', 'user-1', {
        status: ApplicationStatusEnum.ACCEPTED,
      });

      expect(repository.updateStatusWithAuditAndWithdrawal).toHaveBeenCalled();
    });

    it('should call NotificationService.sendStatusUpdateEmail after status update', async () => {
      const updatedApp = {
        ...mockApplication,
        status: ApplicationStatus.INTERVIEW_REQUEST,
      };

      repository.findApplicationById.mockResolvedValue(mockApplication as any);
      repository.findUser.mockResolvedValue({ userId: 'employer-1' } as any);
      repository.updateStatusWithAuditAndWithdrawal.mockResolvedValue(updatedApp as any);
      repository.findStudent.mockResolvedValue(mockStudent as any);

      await service.updateApplicationStatus('app-1', 'employer-1', 'user-1', {
        status: ApplicationStatusEnum.INTERVIEW_REQUEST,
      });

      expect(notificationsService.sendStatusUpdateEmail).toHaveBeenCalledWith(
        'student@university.edu',
        'Software Engineer Intern',
        ApplicationStatus.INTERVIEW_REQUEST,
      );
    });
  });

  describe('getApplicationsByJobPost', () => {
    it('should return applicant list for job owner', async () => {
      const applicants = [mockApplication];
      repository.findJobPost.mockResolvedValue(mockJobPost as any);
      repository.findApplicationsByJobPost.mockResolvedValue(applicants as any);

      const result = await service.getApplicationsByJobPost('job-1', 'employer-1');

      expect(result).toHaveLength(1);
      expect(result[0].applicationId).toBe('app-1');
      expect(result[0].student.studentId).toBe('student-1');
      expect(repository.findJobPost).toHaveBeenCalledWith('job-1');
      expect(repository.findApplicationsByJobPost).toHaveBeenCalledWith('job-1');
    });

    it('should throw ForbiddenException when employer does not own the job post', async () => {
      const wrongEmployerPost = { ...mockJobPost, employerId: 'different-employer' };
      repository.findJobPost.mockResolvedValue(wrongEmployerPost as any);

      await expect(
        service.getApplicationsByJobPost('job-1', 'employer-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when job post does not exist', async () => {
      repository.findJobPost.mockResolvedValue(null);

      await expect(
        service.getApplicationsByJobPost('job-1', 'employer-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
