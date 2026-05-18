import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { StudentsService } from '../src/students/students.service';
import { EmployersService } from '../src/employers/employers.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock data
const mockUserStudent = {
  userId: 'user-uuid-1',
  email: 'student@test.com',
  passwordHash: 'hashed_password',
  role: 'STUDENT',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserEmployer = {
  userId: 'user-uuid-2',
  email: 'employer@test.com',
  passwordHash: 'hashed_password',
  role: 'EMPLOYER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudent = {
  studentId: 'student-uuid-1',
  userId: 'user-uuid-1',
  studentCode: '66070503479',
  firstName: 'SupaKrit',
  lastName: 'Jirachai',
  gpa: 3.45,
  faculty: 'Engineering',
  department: 'Computer Engineering',
  academicYear: 3,
  eligibilityStatus: 'PENDING',
};

const mockEmployer = {
  employerId: 'employer-uuid-1',
  userId: 'user-uuid-2',
  companyName: 'Acme Corp',
  industry: 'Technology',
  website: 'https://acme.com',
  contactName: 'Jane Doe',
  contactPhone: '0812345678',
  isVerified: true,
};

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockStudentsService = {
    findByUserId: jest.fn(),
  };

  const mockEmployersService = {
    findByUserId: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    student: {
      create: jest.fn(),
    },
    employer: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: EmployersService, useValue: mockEmployersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStudent()', () => {
    it('should hash password and create user with role STUDENT', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserStudent);

      const result = await service.registerStudent({
        email: 'student@test.com',
        password: 'password123',
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        gpa: 3.45,
        faculty: 'Engineering',
        department: 'Computer Engineering',
        academicYear: 3,
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.message).toEqual('Register successful');
      expect(result.userId).toEqual(mockUserStudent.userId);
    });

    it('should create student with eligibilityStatus PENDING', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserStudent);

      await service.registerStudent({
        email: 'student@test.com',
        password: 'password123',
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        gpa: 3.45,
        faculty: 'Engineering',
        department: 'Computer Engineering',
        academicYear: 3,
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCallback = mockPrismaService.$transaction.mock.calls[0][0];
      expect(typeof transactionCallback).toBe('function');
    });

    it('should return { message, userId } on success', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserStudent);

      const result = await service.registerStudent({
        email: 'student@test.com',
        password: 'password123',
        studentCode: '66070503479',
        firstName: 'SupaKrit',
        lastName: 'Jirachai',
        gpa: 3.45,
        faculty: 'Engineering',
        department: 'Computer Engineering',
        academicYear: 3,
      });

      expect(result).toEqual({
        message: 'Register successful',
        userId: mockUserStudent.userId,
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockPrismaService.$transaction.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.registerStudent({
          email: 'student@test.com',
          password: 'password123',
          studentCode: '66070503479',
          firstName: 'SupaKrit',
          lastName: 'Jirachai',
          gpa: 3.45,
          faculty: 'Engineering',
          department: 'Computer Engineering',
          academicYear: 3,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerEmployer()', () => {
    it('should hash password and create user with role EMPLOYER', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserEmployer);

      const result = await service.registerEmployer({
        email: 'employer@test.com',
        password: 'password123',
        companyName: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.com',
        contactName: 'Jane Doe',
        contactPhone: '0812345678',
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.message).toEqual('Register successful');
      expect(result.userId).toEqual(mockUserEmployer.userId);
    });

    it('should create employer with isVerified false', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserEmployer);

      await service.registerEmployer({
        email: 'employer@test.com',
        password: 'password123',
        companyName: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.com',
        contactName: 'Jane Doe',
        contactPhone: '0812345678',
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should return { message, userId } on success', async () => {
      mockPrismaService.$transaction.mockResolvedValue(mockUserEmployer);

      const result = await service.registerEmployer({
        email: 'employer@test.com',
        password: 'password123',
        companyName: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.com',
        contactName: 'Jane Doe',
        contactPhone: '0812345678',
      });

      expect(result).toEqual({
        message: 'Register successful',
        userId: mockUserEmployer.userId,
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockPrismaService.$transaction.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.registerEmployer({
          email: 'employer@test.com',
          password: 'password123',
          companyName: 'Acme Corp',
          industry: 'Technology',
          website: 'https://acme.com',
          contactName: 'Jane Doe',
          contactPhone: '0812345678',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login()', () => {
    it('should return { accessToken, role, userId } on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserStudent);
      mockJwtService.sign.mockReturnValue('valid_token');
      mockStudentsService.findByUserId.mockResolvedValue(mockStudent);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('student@test.com', 'password123');

      expect(result.accessToken).toBeDefined();
      expect(result.role).toEqual('STUDENT');
      expect(result.userId).toEqual(mockUserStudent.userId);
      expect(result.email).toEqual(mockUserStudent.email);
      expect(result.gpa).toEqual(mockStudent.gpa);
    });

    it('should throw UnauthorizedException when email not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('nonexistent@test.com', 'password123')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const userWithWrongPassword = { ...mockUserStudent, passwordHash: 'different_hash' };
      mockUsersService.findByEmail.mockResolvedValue(userWithWrongPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('student@test.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should include gpa only for STUDENT role', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserStudent);
      mockJwtService.sign.mockReturnValue('valid_token');
      mockStudentsService.findByUserId.mockResolvedValue(mockStudent);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('student@test.com', 'password123');

      expect(result.gpa).toBeDefined();
      expect(result.gpa).toEqual(mockStudent.gpa);
    });

    it('should not include gpa for EMPLOYER role', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserEmployer);
      mockJwtService.sign.mockReturnValue('valid_token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('employer@test.com', 'password123');

      expect(result.gpa).toBeUndefined();
    });
  });

  describe('getProfile()', () => {
    it('should return user + student profile when role = STUDENT', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserStudent);
      mockStudentsService.findByUserId.mockResolvedValue(mockStudent);

      const result = await service.getProfile('user-uuid-1');

      expect(result).toEqual({
        userId: mockUserStudent.userId,
        email: mockUserStudent.email,
        role: mockUserStudent.role,
        profile: mockStudent,
      });
    });

    it('should return user + employer profile when role = EMPLOYER', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserEmployer);
      mockEmployersService.findByUserId.mockResolvedValue(mockEmployer);

      const result = await service.getProfile('user-uuid-2');

      expect(result).toEqual({
        userId: mockUserEmployer.userId,
        email: mockUserEmployer.email,
        role: mockUserEmployer.role,
        profile: mockEmployer,
      });
    });

    it('should NOT include passwordHash in response', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserStudent);
      mockStudentsService.findByUserId.mockResolvedValue(mockStudent);

      const result = await service.getProfile('user-uuid-1');

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-uuid')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});