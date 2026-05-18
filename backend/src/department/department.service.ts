import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

export interface ApprovalResponse {
  studentId: string;
  previousStatus: string;
  newStatus: string;
  approvedAt: Date;
}

export interface ApproveStudentDto {
  notes?: string;
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

  async approveStudent(
    studentId: string,
    userId: string,
    approveDto: ApproveStudentDto,
  ): Promise<ApprovalResponse> {
    // Get the department head's record
    const departmentHead = await this.departmentRepository.findDepartmentHeadByUserId(userId);
    if (!departmentHead || !departmentHead.department) {
      throw new NotFoundException('Department head not found');
    }

    // Check if student exists and is in the same department
    const student = await this.departmentRepository.findStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Throw ForbiddenException if student is in a different department
    if (student.department !== departmentHead.department) {
      throw new ForbiddenException(
        'Cannot approve students from other departments',
      );
    }

    const previousStatus = student.eligibilityStatus;

    // Approve the student (set status to ELIGIBLE)
    const verification = await this.departmentRepository.approveStudent(
      studentId,
      userId,
      previousStatus,
      approveDto.notes,
    );

    return {
      studentId,
      previousStatus: verification.previousStatus,
      newStatus: verification.newStatus,
      approvedAt: verification.verifiedAt,
    };
  }
}
