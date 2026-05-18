import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from './department.repository';

export interface StudentResponse {
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

export interface InternshipReportResponse {
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
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async getDepartmentStudents(userId: string): Promise<StudentResponse[]> {
    // Get the department head's record
    const departmentHead = await this.departmentRepository.findDepartmentHeadByUserId(userId);
    if (!departmentHead || !departmentHead.department) {
      throw new NotFoundException('Department head not found');
    }

    // Get students in the same department
    const students = await this.departmentRepository.findStudentsByDepartment(
      departmentHead.department,
    );

    return students.map((student) => ({
      studentId: student.studentId,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      faculty: student.faculty,
      department: student.department,
      gpa: student.gpa,
      academicYear: student.academicYear,
      eligibilityStatus: student.eligibilityStatus,
    }));
  }

  async getInternshipReport(userId: string): Promise<InternshipReportResponse[]> {
    // Get the department head's record
    const departmentHead = await this.departmentRepository.findDepartmentHeadByUserId(userId);
    if (!departmentHead || !departmentHead.department) {
      throw new NotFoundException('Department head not found');
    }

    // Get internship data for students in the same department
    const internships = await this.departmentRepository.getInternshipReports(
      departmentHead.department,
    );

    return internships.map((internship) => ({
      studentCode: internship.studentCode,
      firstName: internship.firstName,
      lastName: internship.lastName,
      faculty: internship.faculty,
      department: internship.department,
      gpa: internship.gpa,
      companyName: internship.companyName,
      jobTitle: internship.jobTitle,
      startDate: internship.startDate,
      endDate: internship.endDate,
      acceptedAt: internship.acceptedAt,
    }));
  }
}
