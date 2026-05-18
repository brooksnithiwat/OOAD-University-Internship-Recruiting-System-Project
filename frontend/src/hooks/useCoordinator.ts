import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  coordinatorService,
  StudentWithEligibility,
  EligibilityUpdatePayload,
} from '../services/coordinator.service';

const COORDINATOR_QUERY_KEYS = {
  students: ['coordinator', 'students'],
  placementReport: ['coordinator', 'placementReport'],
};

/**
 * Hook to fetch all students with eligibility status
 */
export const useCoordinatorStudents = () => {
  return useQuery({
    queryKey: COORDINATOR_QUERY_KEYS.students,
    queryFn: () => coordinatorService.getStudents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to update student eligibility status
 */
export const useUpdateEligibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: EligibilityUpdatePayload;
    }) => coordinatorService.updateEligibility(studentId, payload),
    onSuccess: (data) => {
      // Update the students list by merging the response with existing data
      queryClient.setQueryData(COORDINATOR_QUERY_KEYS.students, (old: StudentWithEligibility[] | undefined) => {
        if (!old) return old;
        return old.map((student) => {
          if (student.studentId === data.studentId) {
            // Merge: keep all existing fields but update the status
            return {
              ...student,
              eligibilityStatus: (data.eligibilityStatus as 'ELIGIBLE' | 'PENDING'),
            };
          }
          return student;
        });
      });
    },
  });
};

/**
 * Hook to download placement report
 */
export const useDownloadPlacementReport = () => {
  return useMutation({
    mutationFn: () => coordinatorService.downloadPlacementReport(),
    onSuccess: (blob) => {
      // Trigger file download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `placement-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
