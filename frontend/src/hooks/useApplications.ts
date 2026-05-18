import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as applicationService from '../services/application.service';
import { useAuth } from '../contexts/auth';

export const MY_APPLICATIONS_KEY = ['applications', 'my'] as const;

export const jobApplicantsKey = (jobId: string) => ['applications', jobId] as const;

export function useMyApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...MY_APPLICATIONS_KEY, user?.userId],
    queryFn: () => applicationService.getMyApplications(),
    staleTime: 1000 * 30,
  });
}

export function useJobApplicants(jobId: string | undefined) {
  return useQuery({
    queryKey: jobId ? jobApplicantsKey(jobId) : MY_APPLICATIONS_KEY,
    queryFn: () => applicationService.getJobApplicants(jobId!),
    enabled: !!jobId,
    staleTime: 1000 * 30,
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId }: { applicationId: string }) =>
      applicationService.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplicationStatus(jobId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      note,
    }: {
      applicationId: string;
      status: applicationService.ApplicationStatus;
      note?: string;
    }) => applicationService.updateApplicationStatus(applicationId, status, note),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: jobApplicantsKey(jobId) });
      }
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}