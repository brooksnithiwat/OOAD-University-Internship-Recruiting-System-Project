import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { EmployersService } from '../employers/employers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { CreateEmployerDto } from '../employers/dto/create-employer.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly employersService: EmployersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async registerStudent(createStudentDto: CreateStudentDto) {
    const passwordHash = await bcrypt.hash(createStudentDto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: createStudentDto.email,
            passwordHash,
            role: 'STUDENT',
          },
        });

        await tx.student.create({
          data: {
            userId: user.userId,
            studentCode: createStudentDto.studentCode,
            firstName: createStudentDto.firstName,
            lastName: createStudentDto.lastName,
            gpa: createStudentDto.gpa,
            faculty: createStudentDto.faculty || null,
            department: createStudentDto.department || null,
            academicYear: createStudentDto.academicYear,
            eligibilityStatus: 'PENDING',
          },
        });

        return user;
      });

      return {
        message: 'Register successful',
        userId: result.userId,
      };
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new BadRequestException('Email or student code already exists');
      }
      throw error;
    }
  }

  async registerEmployer(createEmployerDto: CreateEmployerDto) {
    const passwordHash = await bcrypt.hash(createEmployerDto.password, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: createEmployerDto.email,
            passwordHash,
            role: 'EMPLOYER',
          },
        });

        await tx.employer.create({
          data: {
            userId: user.userId,
            companyName: createEmployerDto.companyName,
            industry: createEmployerDto.industry || null,
            website: createEmployerDto.website || null,
            contactName: createEmployerDto.contactName || null,
            contactPhone: createEmployerDto.contactPhone || null,
            isVerified: false,
          },
        });

        return user;
      });

      return {
        message: 'Register successful',
        userId: result.userId,
      };
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.userId, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });

    // Get GPA for students
    let gpa: number | undefined;
    if (user.role === Role.STUDENT) {
      const student = await this.studentsService.findByUserId(user.userId);
      if (student) {
        gpa = student.gpa;
      }
    }

    return {
      accessToken,
      role: user.role,
      userId: user.userId,
      email: user.email,
      gpa,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let profile = null;

    if (user.role === Role.STUDENT) {
      profile = await this.studentsService.findByUserId(userId);
    } else if (user.role === Role.EMPLOYER) {
      profile = await this.employersService.findByUserId(userId);
    }

    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      profile,
    };
  }
}
