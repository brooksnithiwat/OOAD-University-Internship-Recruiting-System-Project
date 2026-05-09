import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { SearchUsersDto } from './dto/search-users.dto';

export interface UserData {
  userId: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItemData {
  userId: string;
  email: string;
  role: Role;
  department: string | null;
  academicYear: number | null;
  faculty: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToUserData(user) : null;
  }

  async findById(userId: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });
    return user ? this.mapToUserData(user) : null;
  }

  async create(
    email: string,
    passwordHash: string,
    role: Role,
  ): Promise<UserData> {
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
    return this.mapToUserData(user);
  }

  async findAll(filters: SearchUsersDto): Promise<UserListItemData[]> {
    const whereClause: Prisma.UserWhereInput = {};

    if (filters.role) {
      whereClause.role = filters.role;
    }

    if (filters.search) {
      whereClause.email = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        userId: true,
        email: true,
        role: true,
        student: {
          select: {
            department: true,
            academicYear: true,
            faculty: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      userId: user.userId,
      email: user.email,
      role: user.role as Role,
      department: user.student?.department ?? null,
      academicYear: user.student?.academicYear ?? null,
      faculty: user.student?.faculty ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  private mapToUserData(user: any): UserData {
    return {
      userId: user.userId,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
