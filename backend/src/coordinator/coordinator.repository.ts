import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface StudentWithEligibility {
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

export interface EligibilityVerificationRecord {
  verificationId: string;
  previousStatus: string;
  newStatus: string;
  verifiedAt: Date;
}

export interface PlacementReportData {
  studentCode: string;
  firstName: string;
  lastName: string;
  faculty: string | null;
  department: string | null;
  gpa: string;
  companyName: string;
  jobTitle: string;
  acceptedAt: Date;
}

@Injectable()
export class CoordinatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllStudents(): Promise<StudentWithEligibility[]> {
    const students = await this.prisma.student.findMany({
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

  async findStudentById(studentId: string): Promise<StudentWithEligibility | null> {
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

  async findCoordinatorByUserId(userId: string) {
    return this.prisma.universityCoordinator.findUnique({
      where: { userId },
    });
  }

  async updateStudentEligibility(
    studentId: string,
    newStatus: string,
    userId: string,
    previousStatus: string,
    notes?: string,
  ): Promise<EligibilityVerificationRecord> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Update student eligibility status
      await tx.student.update({
        where: { studentId },
        data: {
          eligibilityStatus: newStatus as any,
        },
      });

      // Record verification log
      const verification = await tx.eligibilityVerification.create({
        data: {
          studentId,
          verifiedBy: userId,
          previousStatus,
          newStatus,
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

  async getPlacementReports(): Promise<PlacementReportData[]> {
    const placements = await this.prisma.application.findMany({
      where: {
        status: 'ACCEPTED',
      },
      select: {
        student: {
          select: {
            studentCode: true,
            firstName: true,
            lastName: true,
            faculty: true,
            department: true,
            gpa: true,
          },
        },
        jobPost: {
          select: {
            title: true,
            employer: {
              select: {
                companyName: true,
              },
            },
          },
        },
        submittedAt: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return placements.map((placement) => ({
      studentCode: placement.student.studentCode,
      firstName: placement.student.firstName,
      lastName: placement.student.lastName,
      faculty: placement.student.faculty,
      department: placement.student.department,
      gpa: placement.student.gpa.toString(),
      companyName: placement.jobPost.employer.companyName,
      jobTitle: placement.jobPost.title,
      acceptedAt: placement.submittedAt,
    }));
  }
}
