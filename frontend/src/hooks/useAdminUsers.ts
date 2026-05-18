import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminUserService,
  User,
  CreateStaffPayload,
  DeactivatePayload,
  UserCreateResponse,
} from '../services/adminUser.service';

const ADMIN_QUERY_KEYS = {
  users: ['admin', 'users'],
};

/**
 * Hook to fetch all users
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users,
    queryFn: () => adminUserService.getAllUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to create a new staff user
 */
export const useCreateStaffUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => adminUserService.createStaffUser(payload),
    onSuccess: (data: UserCreateResponse) => {
      // Refetch users list
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.users });
    },
  });
};

/**
 * Hook to deactivate a user
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload?: DeactivatePayload;
    }) => adminUserService.deactivateUser(userId, payload),
    onSuccess: (data) => {
      // Update the users list optimistically
      queryClient.setQueryData(ADMIN_QUERY_KEYS.users, (old: User[] | undefined) => {
        if (!old) return [data];
        return old.map((user) => (user.id === data.id ? data : user));
      });
    },
  });
};
