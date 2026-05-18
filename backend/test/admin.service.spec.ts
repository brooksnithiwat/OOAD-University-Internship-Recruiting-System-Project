import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AdminService } from '../src/admin/admin.service';
import { AdminRepository } from '../src/admin/admin.repository';
import { CreateStaffUserDto } from '../src/admin/dto/create-staff-user.dto';
import { Role } from '../src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AdminService', () => {
  let service: AdminService;
  let repository: AdminRepository;

  const mockAdminRepository = {
    findEmployers: jest.fn(),
    findUnverifiedEmployers: jest.fn(),
    findById: jest.fn(),
    verifyEmployer: jest.fn(),
    createStaffUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    deactivateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    repository = module.get<AdminRepository>(AdminRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStaffUser', () => {
    it('should create UNIVERSITY_COORDINATOR account successfully', async () => {
      const createDto: CreateStaffUserDto = {
        email: 'coordinator@uni.ac.th',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        department: 'Computer Engineering',
        role: Role.UNIVERSITY_COORDINATOR,
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockResponse = {
        userId: 'coordinator-1',
        email: 'coordinator@uni.ac.th',
        role: Role.UNIVERSITY_COORDINATOR,
      };

      mockAdminRepository.findUserByEmail.mockResolvedValue(null);
      mockAdminRepository.createStaffUser.mockResolvedValue(mockResponse);

      const result = await service.createStaffUser(createDto);

      expect(result).toEqual(mockResponse);
      expect(repository.createStaffUser).toHaveBeenCalledWith(
        'coordinator@uni.ac.th',
        hashedPassword,
        'Jane',
        'Doe',
        'Computer Engineering',
        Role.UNIVERSITY_COORDINATOR,
      );
    });

    it('should create DEPARTMENT_HEAD account successfully', async () => {
      const createDto: CreateStaffUserDto = {
        email: 'head@uni.ac.th',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        department: 'Computer Engineering',
        role: Role.DEPARTMENT_HEAD,
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockResponse = {
        userId: 'head-1',
        email: 'head@uni.ac.th',
        role: Role.DEPARTMENT_HEAD,
      };

      mockAdminRepository.findUserByEmail.mockResolvedValue(null);
      mockAdminRepository.createStaffUser.mockResolvedValue(mockResponse);

      const result = await service.createStaffUser(createDto);

      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException when role is STUDENT', async () => {
      const createDto: CreateStaffUserDto = {
        email: 'student@uni.ac.th',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.STUDENT,
      };

      await expect(service.createStaffUser(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when role is EMPLOYER', async () => {
      const createDto: CreateStaffUserDto = {
        email: 'employer@company.com',
        password: 'password123',
        firstName: 'Company',
        lastName: 'Admin',
        role: Role.EMPLOYER,
      };

      await expect(service.createStaffUser(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createDto: CreateStaffUserDto = {
        email: 'coordinator@uni.ac.th',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.UNIVERSITY_COORDINATOR,
      };

      mockAdminRepository.findUserByEmail.mockResolvedValue({
        userId: 'existing-1',
      });

      await expect(service.createStaffUser(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users in the system', async () => {
      const mockUsers = [
        {
          userId: 'user-1',
          email: 'student@uni.ac.th',
          role: 'STUDENT',
          isActive: true,
          createdAt: new Date(),
        },
        {
          userId: 'coordinator-1',
          email: 'coordinator@uni.ac.th',
          role: 'UNIVERSITY_COORDINATOR',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      mockAdminRepository.findAllUsers.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(repository.findAllUsers).toHaveBeenCalled();
    });
  });

  describe('deactivateUser', () => {
    it('should set isActive to false for target user', async () => {
      const userId = 'user-1';
      const adminUserId = 'admin-1';

      mockAdminRepository.findUserById.mockResolvedValue({
        userId,
        email: 'student@uni.ac.th',
        role: 'STUDENT',
        isActive: true,
      });

      mockAdminRepository.deactivateUser.mockResolvedValue(undefined);

      const result = await service.deactivateUser(userId, adminUserId);

      expect(result.message).toBe('User deactivated successfully');
      expect(repository.deactivateUser).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException when admin tries to deactivate own account', async () => {
      const userId = 'admin-1';
      const adminUserId = 'admin-1';

      await expect(
        service.deactivateUser(userId, adminUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent-user';
      const adminUserId = 'admin-1';

      mockAdminRepository.findUserById.mockResolvedValue(null);

      await expect(
        service.deactivateUser(userId, adminUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
