import axios from '../lib/axios';
import { StudentWithEligibility } from './coordinator.service';

export interface ApprovableStudent extends StudentWithEligibility {
  departmentHeadId: string;
}

export const departmentService = {
  /**
   * Fetch students in the department head's department
   */
  async getDepartmentStudents(): Promise<StudentWithEligibility[]> {
    const response = await axios.get<StudentWithEligibility[]>('/department/students');
    return response.data;
  },

  /**
   * Download internship report as CSV
   */
  async downloadInternshipReport(): Promise<Blob> {
    const response = await axios.get('/department/reports/internships', {
      responseType: 'blob',
    });
    return response.data;
  },
};
