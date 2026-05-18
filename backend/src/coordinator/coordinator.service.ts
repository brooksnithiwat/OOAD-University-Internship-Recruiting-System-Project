import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CoordinatorRepository } from './coordinator.repository';
import { UpdateEligibilityDto } from './dto/update-eligibility.dto';

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

export interface UpdateEligibilityResponse {
  studentId: string;
  previousStatus: string;
  newStatus: string;
  verifiedAt: Date;
}

export interface PlacementReportResponse {
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
export class CoordinatorService {
  constructor(private readonly coordinatorRepository: CoordinatorRepository) {}

  async getStudents(): Promise<StudentResponse[]> {
    const students = await this.coordinatorRepository.findAllStudents();
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

  async updateEligibility(
    studentId: string,
    userId: string,
    updateEligibilityDto: UpdateEligibilityDto,
  ): Promise<UpdateEligibilityResponse> {
    // Check if student exists and get previous status
    const student = await this.coordinatorRepository.findStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get the coordinator record to get coordinatorId
    const coordinator = await this.coordinatorRepository.findCoordinatorByUserId(userId);
    if (!coordinator) {
      throw new BadRequestException('Coordinator record not found');
    }

    const previousStatus = student.eligibilityStatus;

    // Update eligibility status
    const verification = await this.coordinatorRepository.updateStudentEligibility(
      studentId,
      updateEligibilityDto.status,
      userId,
      previousStatus,
      updateEligibilityDto.notes,
    );

    return {
      studentId,
      previousStatus: verification.previousStatus,
      newStatus: verification.newStatus,
      verifiedAt: verification.verifiedAt,
    };
  }

  async getPlacementReport(): Promise<PlacementReportResponse[]> {
    const placements = await this.coordinatorRepository.getPlacementReports();
    return placements.map((placement) => ({
      studentCode: placement.studentCode,
      firstName: placement.firstName,
      lastName: placement.lastName,
      faculty: placement.faculty,
      department: placement.department,
      gpa: placement.gpa,
      companyName: placement.companyName,
      jobTitle: placement.jobTitle,
      acceptedAt: placement.acceptedAt,
    }));
  }
}
