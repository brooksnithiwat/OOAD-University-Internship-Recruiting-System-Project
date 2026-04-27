import { Injectable } from '@nestjs/common';
import { EmployersRepository, EmployerData } from './employers.repository';
import { CreateEmployerDto } from './dto/create-employer.dto';

@Injectable()
export class EmployersService {
  constructor(private readonly employersRepository: EmployersRepository) {}

  async findByUserId(userId: string): Promise<EmployerData | null> {
    return this.employersRepository.findByUserId(userId);
  }

  async findById(employerId: string): Promise<EmployerData | null> {
    return this.employersRepository.findById(employerId);
  }

  async createEmployer(
    userId: string,
    createEmployerDto: CreateEmployerDto,
  ): Promise<EmployerData> {
    return this.employersRepository.create(
      userId,
      createEmployerDto.companyName,
      createEmployerDto.industry,
      createEmployerDto.website,
      createEmployerDto.contactName,
      createEmployerDto.contactPhone,
    );
  }
}
