import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostService, JobPostFilters, JobPostListResponse, JobPostDetail, CreateJobPostRequest } from '../services/jobPost.service';
import { useAuth } from '../contexts/auth';

export const useJobPosts = (filters: JobPostFilters, isEmployer: boolean = false) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['job-posts', filters, isEmployer, user?.userId],
    queryFn: () => isEmployer ? jobPostService.getEmployerJobPosts(filters) : jobPostService.getJobPosts(filters),
    staleTime: 60000,
  });
};

export const useJobPost = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job-posts', jobId],
    queryFn: () => jobPostService.getJobPostById(jobId!),
    enabled: !!jobId,
    staleTime: 60000,
  });
};

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPostRequest) => jobPostService.createJobPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
};

export const useUpdateJobPost = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateJobPostRequest>) =>
      jobPostService.updateJobPost(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
};

export const useCloseJobPost = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => jobPostService.closeJobPost(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
    },
  });
};
