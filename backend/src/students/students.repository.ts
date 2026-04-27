import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EligibilityStatus } from '../common/enums/eligibility-status.enum';

export interface StudentData {
  studentId: string;
  userId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  gpa: number;
  faculty: string | null;
  department: string | null;
  academicYear: number;
  eligibilityStatus: EligibilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    studentCode: string,
    firstName: string,
    lastName: string,
    gpa: number,
    faculty: string | undefined,
    department: string | undefined,
    academicYear: number,
  ): Promise<StudentData> {
    const student = await this.prisma.student.create({
      data: {
        userId,
        studentCode,
        firstName,
        lastName,
        gpa,
        faculty: faculty || null,
        department: department || null,
        academicYear,
        eligibilityStatus: 'PENDING',
      },
    });
    return this.mapToStudentData(student);
  }

  async findByStudentCode(studentCode: string): Promise<StudentData | null> {
    const student = await this.prisma.student.findUnique({
      where: { studentCode },
    });
    return student ? this.mapToStudentData(student) : null;
  }

  async findByUserId(userId: string): Promise<StudentData | null> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    return student ? this.mapToStudentData(student) : null;
  }

  async findById(studentId: string): Promise<StudentData | null> {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
    });
    return student ? this.mapToStudentData(student) : null;
  }

  private mapToStudentData(student: any): StudentData {
    return {
      studentId: student.studentId,
      userId: student.userId,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      gpa: Number(student.gpa),
      faculty: student.faculty,
      department: student.department,
      academicYear: student.academicYear,
      eligibilityStatus: student.eligibilityStatus,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
