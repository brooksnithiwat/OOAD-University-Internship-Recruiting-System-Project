import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface DepartmentStudentData {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  faculty: string | null;
  department: string | null;
  gpa: string;
  academicYear: number;
  eligibilityStatus: string;
}

export interface StudentDepartmentData {
  department: string | null;
}

export interface ApprovalVerificationData {
  verificationId: string;
  previousStatus: string;
  newStatus: string;
  verifiedAt: Date;
}

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDepartmentHeadById(headId: string): Promise<{ department: string } | null> {
    const departmentHead = await this.prisma.departmentHead.findUnique({
      where: { headId },
      select: { department: true },
    });
    return departmentHead;
  }

  async findDepartmentHeadByUserId(userId: string): Promise<{ headId: string; department: string } | null> {
    const departmentHead = await this.prisma.departmentHead.findUnique({
      where: { userId },
      select: { headId: true, department: true },
    });
    return departmentHead;
  }

  async findStudentsByDepartment(department: string): Promise<DepartmentStudentData[]> {
    const students = await this.prisma.student.findMany({
      where: { department },
      select: {
        studentId: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        faculty: true,
        department: true,
        gpa: true,
        academicYear: true,
        eligibilityStatus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return students.map((student) => ({
      ...student,
      gpa: student.gpa.toString(),
      eligibilityStatus: student.eligibilityStatus,
    }));
  }

  async findStudentById(studentId: string): Promise<DepartmentStudentData | null> {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      select: {
        studentId: true,
        studentCode: true,
        firstName: true,
        lastName: true,
        faculty: true,
        department: true,
        gpa: true,
        academicYear: true,
        eligibilityStatus: true,
      },
    });

    if (!student) {
      return null;
    }

    return {
      ...student,
      gpa: student.gpa.toString(),
      eligibilityStatus: student.eligibilityStatus,
    };
  }

  async approveStudent(
    studentId: string,
    userId: string,
    previousStatus: string,
    notes?: string,
  ): Promise<ApprovalVerificationData> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Update student eligibility status to ELIGIBLE
      await tx.student.update({
        where: { studentId },
        data: {
          eligibilityStatus: 'ELIGIBLE' as any,
        },
      });

      // Record verification log (using userId as verifiedBy)
      const verification = await tx.eligibilityVerification.create({
        data: {
          studentId,
          verifiedBy: userId,
          previousStatus,
          newStatus: 'ELIGIBLE',
          notes: notes || null,
        },
        select: {
          verificationId: true,
          previousStatus: true,
          newStatus: true,
          verifiedAt: true,
        },
      });

      return verification;
    });

    return result;
  }
}
