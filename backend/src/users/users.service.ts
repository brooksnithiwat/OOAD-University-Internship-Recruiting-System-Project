import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository, UserData } from './users.repository';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<UserData | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(userId: string): Promise<UserData | null> {
    return this.usersRepository.findById(userId);
  }

  async createUser(
    email: string,
    passwordHash: string,
    role: Role,
  ): Promise<UserData> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.usersRepository.create(email, passwordHash, role);
  }
}
