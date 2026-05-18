import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DepartmentService } from '../src/department/department.service';
import { DepartmentRepository } from '../src/department/department.repository';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repository: DepartmentRepository;

  const mockDepartmentRepository = {
    findDepartmentHeadById: jest.fn(),
    findStudentsByDepartment: jest.fn(),
    findStudentById: jest.fn(),
    approveStudent: jest.fn(),
    findDepartmentHeadByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: DepartmentRepository,
          useValue: mockDepartmentRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repository = module.get<DepartmentRepository>(DepartmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDepartmentStudents', () => {
    it('should return only students in the same department as Department Head', async () => {
      const userId = 'user-1';
      const department = 'Computer Engineering';

      const mockDepartmentHead = { headId: 'head-1', userId, firstName: 'Jane', lastName: 'Head', department };
      const mockStudents = [
        {
          studentId: 'student-1',
          studentCode: '66070503910',
          firstName: 'SupaKrit',
          lastName: 'Jirachai',
          faculty: 'Engineering',
          department: 'Computer Engineering',
          gpa: '3.45',
          academicYear: 3,
          eligibilityStatus: 'PENDING',
        },
      ];

      mockDepartmentRepository.findDepartmentHeadByUserId.mockResolvedValue(
        mockDepartmentHead,
      );
      mockDepartmentRepository.findStudentsByDepartment.mockResolvedValue(
        mockStudents,
      );

      const result = await service.getDepartmentStudents(userId);

      expect(result).toEqual(mockStudents);
      expect(repository.findDepartmentHeadByUserId).toHaveBeenCalledWith(userId);
      expect(repository.findStudentsByDepartment).toHaveBeenCalledWith(department);
    });

    it('should NOT return students from other departments', async () => {
      const userId = 'user-1';
      const department = 'Computer Engineering';

      const mockDepartmentHead = { headId: 'head-1', userId, firstName: 'Jane', lastName: 'Head', department };
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
      ];

      mockDepartmentRepository.findDepartmentHeadByUserId.mockResolvedValue(
        mockDepartmentHead,
      );
      mockDepartmentRepository.findStudentsByDepartment.mockResolvedValue(
        mockStudents,
      );

      const result = await service.getDepartmentStudents(userId);

      // Should not include students from Physics department
      const physicsStudent = result.find((s) => s.department === 'Physics');
      expect(physicsStudent).toBeUndefined();
    });
  });

  describe('approveStudent', () => {
    it('should set eligibilityStatus to ELIGIBLE for student in same department', async () => {
      const studentId = 'student-1';
      const userId = 'user-1';
      const headId = 'head-1';
      const department = 'Computer Engineering';
      const approveDto = { notes: 'Approved by department head' };

      const mockDepartmentHead = { headId, userId, firstName: 'Jane', lastName: 'Head', department };
      const mockStudent = {
        studentId,
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        faculty: 'Engineering',
        department: 'Computer Engineering',
        gpa: '3.45',
        academicYear: 3,
        eligibilityStatus: 'PENDING',
      };

      const mockVerification = {
        verificationId: 'verification-1',
        previousStatus: 'PENDING',
        newStatus: 'ELIGIBLE',
        verifiedAt: new Date(),
      };

      mockDepartmentRepository.findDepartmentHeadByUserId.mockResolvedValue(
        mockDepartmentHead,
      );
      mockDepartmentRepository.findStudentById.mockResolvedValue(mockStudent);
      mockDepartmentRepository.approveStudent.mockResolvedValue(mockVerification);

      const result = await service.approveStudent(
        studentId,
        userId,
        approveDto,
      );

      expect(result.newStatus).toBe('ELIGIBLE');
      expect(repository.findDepartmentHeadByUserId).toHaveBeenCalledWith(userId);
      expect(repository.approveStudent).toHaveBeenCalledWith(
        studentId,
        userId,
        'PENDING',
        'Approved by department head',
      );
    });

    it('should throw ForbiddenException when student is in different department', async () => {
      const studentId = 'student-1';
      const userId = 'user-1';
      const approveDto = { notes: 'Try to approve' };

      const mockDepartmentHead = { headId: 'head-1', userId, firstName: 'Jane', lastName: 'Head', department: 'Computer Engineering' };
      const mockStudent = {
        studentId,
        studentCode: '66070503410',
        firstName: 'John',
        lastName: 'Doe',
        faculty: 'Science',
        department: 'Physics',
        gpa: '3.50',
        academicYear: 2,
        eligibilityStatus: 'PENDING',
      };

      mockDepartmentRepository.findDepartmentHeadByUserId.mockResolvedValue(
        mockDepartmentHead,
      );
      mockDepartmentRepository.findStudentById.mockResolvedValue(mockStudent);

      await expect(
        service.approveStudent(studentId, userId, approveDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when student not found', async () => {
      const studentId = 'nonexistent-student';
      const userId = 'user-1';
      const approveDto = { notes: 'Try to approve' };

      const mockDepartmentHead = { headId: 'head-1', userId, firstName: 'Jane', lastName: 'Head', department: 'Computer Engineering' };

      mockDepartmentRepository.findDepartmentHeadByUserId.mockResolvedValue(
        mockDepartmentHead,
      );
      mockDepartmentRepository.findStudentById.mockResolvedValue(null);

      await expect(
        service.approveStudent(studentId, userId, approveDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
