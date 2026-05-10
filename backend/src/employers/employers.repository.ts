import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface EmployerData {
  employerId: string;
  userId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class EmployersRepository {
  constructor(private readonly prisma: PrismaService) {}
 
  
  async create(
    userId: string,
    companyName: string,
    industry: string | undefined,
    website: string | undefined,
    contactName: string | undefined,
    contactPhone: string | undefined,
  ): Promise<EmployerData> {
    const employer = await this.prisma.employer.create({
      data: {
        userId,
        companyName,
        industry: industry || null,
        website: website || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        isVerified: false,
      },
    });
    return this.mapToEmployerData(employer);
  }

  async findByUserId(userId: string): Promise<EmployerData | null> {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });
    return employer ? this.mapToEmployerData(employer) : null;
  }

  async findById(employerId: string): Promise<EmployerData | null> {
    const employer = await this.prisma.employer.findUnique({
      where: { employerId },
    });
    return employer ? this.mapToEmployerData(employer) : null;
  }

  private mapToEmployerData(employer: any): EmployerData {
    return {
      employerId: employer.employerId,
      userId: employer.userId,
      companyName: employer.companyName,
      industry: employer.industry,
      website: employer.website,
      contactName: employer.contactName,
      contactPhone: employer.contactPhone,
      isVerified: employer.isVerified,
      createdAt: employer.createdAt,
      updatedAt: employer.updatedAt,
    };
  }
}
