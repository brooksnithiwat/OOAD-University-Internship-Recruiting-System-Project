import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoordinatorService } from '../src/coordinator/coordinator.service';
import { CoordinatorRepository } from '../src/coordinator/coordinator.repository';
import { UpdateEligibilityDto } from '../src/coordinator/dto/update-eligibility.dto';
import { EligibilityStatus } from '../src/common/enums/eligibility-status.enum';

describe('CoordinatorService', () => {
  let service: CoordinatorService;
  let repository: CoordinatorRepository;

  const mockCoordinatorRepository = {
    findAllStudents: jest.fn(),
    findStudentById: jest.fn(),
    updateStudentEligibility: jest.fn(),
    getPlacementReports: jest.fn(),
    findCoordinatorByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        {
          provide: CoordinatorRepository,
          useValue: mockCoordinatorRepository,
        },
      ],
    }).compile();

    service = module.get<CoordinatorService>(CoordinatorService);
    repository = module.get<CoordinatorRepository>(CoordinatorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('should return all students regardless of department', async () => {
      const mockStudents = [
        {
          studentId: 'student-1',
          studentCode: '66070503479',
          firstName: 'SupaKrit',
          lastName: 'Jirachai',
          faculty: 'Engineering',
          department: 'Computer Engineering',
          gpa: '3.45',
          academicYear: 3,
          eligibilityStatus: 'PENDING',
        },
        {
          studentId: 'student-2',
          studentCode: '66070503411',
          firstName: 'John',
          lastName: 'Doe',
          faculty: 'Science',
          department: 'Physics',
          gpa: '3.50',
          academicYear: 2,
          eligibilityStatus: 'ELIGIBLE',
        },
      ];

      mockCoordinatorRepository.findAllStudents.mockResolvedValue(mockStudents);

      const result = await service.getStudents();

      expect(result).toEqual(mockStudents);
      expect(repository.findAllStudents).toHaveBeenCalled();
    });
  });

  describe('updateEligibility', () => {
    it('should change status from PENDING to ELIGIBLE and record verification log', async () => {
      const studentId = 'student-1';
      const userId = 'user-1';
      const coordinatorId = 'coordinator-1';
      const updateDto: UpdateEligibilityDto = {
        status: EligibilityStatus.ELIGIBLE,
        notes: 'Student meets all requirements',
      };

      const mockCoordinator = {
        coordinatorId,
        userId,
        firstName: 'Jane',
        lastName: 'Coordinator',
        department: 'Computer Engineering',
      };

      const mockStudent = {
        studentId,
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        faculty: 'Engineering',
        department: 'Computer Engineering',
        gpa: '3.45',
        academicYear: 3,
        eligibilityStatus: EligibilityStatus.PENDING,
      };

      const mockVerification = {
        verificationId: 'verification-1',
        previousStatus: EligibilityStatus.PENDING,
        newStatus: EligibilityStatus.ELIGIBLE,
        verifiedAt: new Date(),
      };

      mockCoordinatorRepository.findCoordinatorByUserId.mockResolvedValue(mockCoordinator);
      mockCoordinatorRepository.findStudentById.mockResolvedValue(mockStudent);
      mockCoordinatorRepository.updateStudentEligibility.mockResolvedValue(
        mockVerification,
      );

      const result = await service.updateEligibility(
        studentId,
        userId,
        updateDto,
      );

      expect(result.previousStatus).toBe(EligibilityStatus.PENDING);
      expect(result.newStatus).toBe(EligibilityStatus.ELIGIBLE);
      expect(repository.findCoordinatorByUserId).toHaveBeenCalledWith(userId);
      expect(repository.findStudentById).toHaveBeenCalledWith(studentId);
      expect(repository.updateStudentEligibility).toHaveBeenCalledWith(
        studentId,
        EligibilityStatus.ELIGIBLE,
        userId,
        EligibilityStatus.PENDING,
        'Student meets all requirements',
      );
    });

    it('should change status from ELIGIBLE back to PENDING', async () => {
      const studentId = 'student-1';
      const userId = 'user-1';
      const coordinatorId = 'coordinator-1';
      const updateDto: UpdateEligibilityDto = {
        status: EligibilityStatus.PENDING,
        notes: 'Status revoked',
      };

      const mockCoordinator = {
        coordinatorId,
        userId,
        firstName: 'Jane',
        lastName: 'Coordinator',
        department: 'Computer Engineering',
      };

      const mockStudent = {
        studentId,
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        faculty: 'Engineering',
        department: 'Computer Engineering',
        gpa: '3.45',
        academicYear: 3,
        eligibilityStatus: EligibilityStatus.ELIGIBLE,
      };

      const mockVerification = {
        verificationId: 'verification-2',
        previousStatus: EligibilityStatus.ELIGIBLE,
        newStatus: EligibilityStatus.PENDING,
        verifiedAt: new Date(),
      };

      mockCoordinatorRepository.findCoordinatorByUserId.mockResolvedValue(mockCoordinator);
      mockCoordinatorRepository.findStudentById.mockResolvedValue(mockStudent);
      mockCoordinatorRepository.updateStudentEligibility.mockResolvedValue(
        mockVerification,
      );

      const result = await service.updateEligibility(
        studentId,
        userId,
        updateDto,
      );

      expect(result.previousStatus).toBe(EligibilityStatus.ELIGIBLE);
      expect(result.newStatus).toBe(EligibilityStatus.PENDING);
    });

    it('should throw NotFoundException if student not found', async () => {
      const studentId = 'nonexistent-student';
      const coordinatorId = 'coordinator-1';
      const updateDto: UpdateEligibilityDto = {
        status: EligibilityStatus.ELIGIBLE,
      };

      mockCoordinatorRepository.findStudentById.mockResolvedValue(null);

      await expect(
        service.updateEligibility(studentId, coordinatorId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlacementReport', () => {
    it('should return only students with ACCEPTED application status', async () => {
      const mockPlacements = [
        {
          studentCode: '66070503479',
          firstName: 'SupaKrit',
          lastName: 'Jirachai',
          faculty: 'Engineering',
          department: 'Computer Engineering',
          gpa: '3.45',
          companyName: 'Tech Corp',
          jobTitle: 'Software Engineer Intern',
          acceptedAt: new Date(),
        },
      ];

      mockCoordinatorRepository.getPlacementReports.mockResolvedValue(
        mockPlacements,
      );

      const result = await service.getPlacementReport();

      expect(result).toEqual(mockPlacements);
      expect(repository.getPlacementReports).toHaveBeenCalled();
    });
  });
});
