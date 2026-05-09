import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EmployerVerificationFilter,
  SearchEmployersDto,
} from './dto/search-employers.dto';

export interface AdminEmployerUserData {
  userId: string;
  email: string;
  createdAt: Date;
}

export interface AdminUnverifiedEmployerData {
  employerId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  user: AdminEmployerUserData;
}

export interface AdminEmployerVerificationData {
  employerId: string;
  isVerified: boolean;
}

type EmployerWithUserSelect = {
  employerId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  user: {
    userId: string;
    email: string;
    createdAt: Date;
  };
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEmployers(filters: SearchEmployersDto): Promise<{
    data: AdminUnverifiedEmployerData[];
    total: number;
  }> {
    const whereClause: Prisma.EmployerWhereInput = {};
    const verificationStatus: EmployerVerificationFilter =
      filters.verificationStatus ?? 'ALL';

    if (verificationStatus === 'APPROVED') {
      whereClause.isVerified = true;
    }

    if (verificationStatus === 'UNAPPROVED') {
      whereClause.isVerified = false;
    }

    if (filters.search) {
      whereClause.user = {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      };
    }

    const [employers, total] = await Promise.all([
      this.prisma.employer.findMany({
        where: whereClause,
        select: {
          employerId: true,
          companyName: true,
          industry: true,
          website: true,
          contactName: true,
          contactPhone: true,
          isVerified: true,
          user: {
            select: {
              userId: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.employer.count({
        where: whereClause,
      }),
    ]);

    return {
      data: employers.map((employer) => this.mapToUnverifiedEmployerData(employer)),
      total,
    };
  }

  async findUnverifiedEmployers(): Promise<{
    data: AdminUnverifiedEmployerData[];
    total: number;
  }> {
    return this.findEmployers({ verificationStatus: 'UNAPPROVED' });
  }

  async findById(
    employerId: string,
  ): Promise<AdminEmployerVerificationData | null> {
    const employer = await this.prisma.employer.findUnique({
      where: {
        employerId,
      },
      select: {
        employerId: true,
        isVerified: true,
      },
    });

    if (!employer) {
      return null;
    }

    return {
      employerId: employer.employerId,
      isVerified: employer.isVerified,
    };
  }

  async verifyEmployer(
    employerId: string,
  ): Promise<AdminEmployerVerificationData> {
    const employer = await this.prisma.employer.update({
      where: {
        employerId,
      },
      data: {
        isVerified: true,
      },
      select: {
        employerId: true,
        isVerified: true,
      },
    });

    return {
      employerId: employer.employerId,
      isVerified: employer.isVerified,
    };
  }

  private mapToUnverifiedEmployerData(
    employer: EmployerWithUserSelect,
  ): AdminUnverifiedEmployerData {
    return {
      employerId: employer.employerId,
      companyName: employer.companyName,
      industry: employer.industry,
      website: employer.website,
      contactName: employer.contactName,
      contactPhone: employer.contactPhone,
      isVerified: employer.isVerified,
      user: {
        userId: employer.user.userId,
        email: employer.user.email,
        createdAt: employer.user.createdAt,
      },
    };
  }
}