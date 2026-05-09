import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  EmployerSearchFilters,
  resolveEmployerId,
  UnverifiedEmployer,
  UserSearchFilters,
} from '@/services/admin.service';

export const unverifiedEmployersQueryKey = ['admin', 'employers', 'unverified'] as const;

export const useUnverifiedEmployers = () => {
  return useQuery({
    queryKey: unverifiedEmployersQueryKey,
    queryFn: adminService.getUnverifiedEmployers,
    staleTime: 30000,
  });
};

export const useEmployers = (filters: EmployerSearchFilters) => {
  return useQuery({
    queryKey: ['admin', 'employers', 'list', filters] as const,
    queryFn: () => adminService.getEmployers(filters),
    staleTime: 30000,
  });
};

export const useTotalUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users', 'total'] as const,
    queryFn: adminService.getTotalUsers,
    staleTime: 60000,
  });
};

export const useUsers = (filters: UserSearchFilters) => {
  return useQuery({
    queryKey: ['admin', 'users', 'list', filters] as const,
    queryFn: () => adminService.getUsers(filters),
    staleTime: 60000,
  });
};

export const useActiveJobPostsCount = () => {
  return useQuery({
    queryKey: ['admin', 'jobs', 'activeCount'] as const,
    queryFn: adminService.getActiveJobPostsCount,
    staleTime: 60000,
  });
};

interface VerifyMutationContext {
  previousEmployers?: UnverifiedEmployer[];
}

export const useVerifyEmployer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employerId: string) => adminService.verifyEmployer(employerId),
    onMutate: async (employerId: string): Promise<VerifyMutationContext> => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'employers'] });

      const previousEmployers = queryClient.getQueryData<UnverifiedEmployer[]>(
        unverifiedEmployersQueryKey,
      );

      queryClient.setQueryData<UnverifiedEmployer[]>(
        unverifiedEmployersQueryKey,
        (currentEmployers = []) =>
          currentEmployers.filter((employer) => resolveEmployerId(employer) !== employerId),
      );

      return { previousEmployers };
    },
    onError: (_error, _employerId, context) => {
      if (context?.previousEmployers) {
        queryClient.setQueryData(unverifiedEmployersQueryKey, context.previousEmployers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'employers'] });
    },
  });
};
