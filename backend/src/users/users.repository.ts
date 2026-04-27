import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

export interface UserData {
  userId: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
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
