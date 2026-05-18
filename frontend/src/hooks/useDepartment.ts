import { useQuery, useMutation } from '@tanstack/react-query';
import { departmentService } from '../services/department.service';
import { useAuth } from '../contexts/auth';

const DEPARTMENT_QUERY_KEYS = {
  students: ['department', 'students'],
  internshipReport: ['department', 'internshipReport'],
};

/**
 * Hook to fetch students in the department head's department
 */
export const useDepartmentStudents = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...DEPARTMENT_QUERY_KEYS.students, user?.userId],
    queryFn: () => departmentService.getDepartmentStudents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to download internship report as CSV
 */
export const useDownloadInternshipReport = () => {
  return useMutation({
    mutationFn: () => departmentService.downloadInternshipReport(),
    onSuccess: (blob) => {
      // Trigger file download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `internships-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
