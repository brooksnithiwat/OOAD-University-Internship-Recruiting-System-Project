import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminEmployerVerificationData,
  AdminRepository,
  AdminUnverifiedEmployerData,
} from './admin.repository';
import { SearchEmployersDto } from './dto/search-employers.dto';

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
}