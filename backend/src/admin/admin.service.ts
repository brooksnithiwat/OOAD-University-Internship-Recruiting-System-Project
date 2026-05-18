import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AdminEmployerVerificationData,
  AdminRepository,
  AdminUnverifiedEmployerData,
} from './admin.repository';
import { SearchEmployersDto } from './dto/search-employers.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getEmployers(filters: SearchEmployersDto): Promise<{
    data: AdminUnverifiedEmployerData[];
    total: number;
  }> {
    return this.adminRepository.findEmployers(filters);
  }

  async getUnverifiedEmployers(): Promise<{
    data: AdminUnverifiedEmployerData[];
    total: number;
  }> {
    return this.adminRepository.findUnverifiedEmployers();
  }

  async verifyEmployer(employerId: string): Promise<{
    message: string;
    employerId: string;
    isVerified: boolean;
  }> {
    const employer = await this.adminRepository.findById(employerId);

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    if (employer.isVerified) {
      throw new ConflictException('Employer is already verified');
    }

    const verifiedEmployer: AdminEmployerVerificationData =
      await this.adminRepository.verifyEmployer(employerId);

    return {
      message: 'Employer verified successfully',
      employerId: verifiedEmployer.employerId,
      isVerified: verifiedEmployer.isVerified,
    };
  }

  async createStaffUser(
    createStaffUserDto: CreateStaffUserDto,
  ): Promise<{ userId: string; email: string; role: string }> {
    // Only allow UNIVERSITY_COORDINATOR or DEPARTMENT_HEAD
    if (
      createStaffUserDto.role !== Role.UNIVERSITY_COORDINATOR &&
      createStaffUserDto.role !== Role.DEPARTMENT_HEAD
    ) {
      throw new BadRequestException(
        'Can only create UNIVERSITY_COORDINATOR or DEPARTMENT_HEAD accounts',
      );
    }

    // Check if email already exists
    const existingUser = await this.adminRepository.findUserByEmail(
      createStaffUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createStaffUserDto.password, 10);

    // Create staff user
    const staffUser = await this.adminRepository.createStaffUser(
      createStaffUserDto.email,
      passwordHash,
      createStaffUserDto.firstName,
      createStaffUserDto.lastName,
      createStaffUserDto.department,
      createStaffUserDto.role,
    );

    return staffUser;
  }

  async getAllUsers(): Promise<
    Array<{
      userId: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>
  > {
    return this.adminRepository.findAllUsers();
  }

  async deactivateUser(userId: string, adminUserId: string): Promise<{
    message: string;
  }> {
    // Cannot deactivate own account
    if (userId === adminUserId) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    // Check if user exists
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Deactivate the user
    await this.adminRepository.deactivateUser(userId);

    return { message: 'User deactivated successfully' };
  }
}