import axios from '../lib/axios';

export interface StudentWithEligibility {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  faculty: string;
  department: string;
  gpa: number;
  academicYear: number;
  eligibilityStatus: 'ELIGIBLE' | 'PENDING';
  createdAt: string;
}

export interface EligibilityUpdatePayload {
  status: 'ELIGIBLE' | 'PENDING';
  notes?: string;
}

export interface StudentStats {
  total: number;
  eligible: number;
  pending: number;
}

export const coordinatorService = {
  /**
   * Fetch all students with their eligibility status
   */
  async getStudents(): Promise<StudentWithEligibility[]> {
    const response = await axios.get<StudentWithEligibility[]>('/coordinator/students');
    return response.data;
  },

  /**
   * Update student eligibility status
   */
  async updateEligibility(
    studentId: string,
    payload: EligibilityUpdatePayload
  ): Promise<StudentWithEligibility> {
    const response = await axios.patch<StudentWithEligibility>(
      `/coordinator/students/${studentId}/eligibility`,
      payload
    );
    return response.data;
  },

  /**
   * Download placement report as CSV
   */
  async downloadPlacementReport(): Promise<Blob> {
    const response = await axios.get('/coordinator/reports/placements', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Calculate student stats from list
   */
  calculateStats(students: StudentWithEligibility[]): StudentStats {
    return {
      total: students.length,
      eligible: students.filter((s) => s.eligibilityStatus === 'ELIGIBLE').length,
      pending: students.filter((s) => s.eligibilityStatus === 'PENDING').length,
    };
  },
};
