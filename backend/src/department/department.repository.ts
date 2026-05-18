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

export interface InternshipReportData {
  studentCode: string;
  firstName: string;
  lastName: string;
  faculty: string | null;
  department: string | null;
  gpa: string;
  companyName: string;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
  acceptedAt: Date;
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

  async getInternshipReports(department: string): Promise<InternshipReportData[]> {
    const internships = await this.prisma.application.findMany({
      where: {
        status: 'ACCEPTED',
        student: {
          department,
        },
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
            durationWeeks: true,
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

    return internships.map((internship) => ({
      studentCode: internship.student.studentCode,
      firstName: internship.student.firstName,
      lastName: internship.student.lastName,
      faculty: internship.student.faculty,
      department: internship.student.department,
      gpa: internship.student.gpa.toString(),
      companyName: internship.jobPost.employer.companyName,
      jobTitle: internship.jobPost.title,
      startDate: null,
      endDate: null,
      acceptedAt: internship.submittedAt,
    }));
  }
}
