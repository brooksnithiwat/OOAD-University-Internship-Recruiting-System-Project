import axiosInstance from '../lib/axios';

export interface JobPostFilters {
  location?: string;
  minGpa?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JobPostResponse {
  jobId: string;
  title: string;
  location: string | null;
  minGpa: number;
  durationWeeks: number;
  applicationDeadline: string;
  companyName: string;
  skills: string[];
  status: string;
}

export interface JobPostListResponse {
  data: JobPostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface JobPostDetail {
  jobId: string;
  title: string;
  description: string;
  location: string | null;
  minGpa: number;
  durationWeeks: number;
  applicationDeadline: string;
  status: string;
  skills: string[];
  employer: {
    companyName: string;
    industry: string;
    website: string | null;
  };
}

export interface CreateJobPostRequest {
  title: string;
  description: string;
  location?: string;
  minGpa: number;
  durationWeeks: number;
  applicationDeadline: string;
  skills: string[];
}

export interface CreateJobPostResponse {
  jobId: string;
  title: string;
  status: string;
}

export const jobPostService = {
  getJobPosts: async (filters: JobPostFilters): Promise<JobPostListResponse> => {
    const params: Record<string, any> = {};
    
    if (filters.location) params.location = filters.location;
    if (filters.minGpa !== undefined) params.minGpa = filters.minGpa;
    if (filters.search) params.search = filters.search;
    if (filters.page && filters.page !== 1) params.page = filters.page;
    if (filters.limit && filters.limit !== 10) params.limit = filters.limit;
    
    const { data } = await axiosInstance.get<JobPostListResponse>('/job-posts', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return data;
  },

  getJobPostById: async (id: string): Promise<JobPostDetail> => {
    const { data } = await axiosInstance.get<JobPostDetail>(`/job-posts/${id}`);
    return data;
  },

  createJobPost: async (payload: CreateJobPostRequest): Promise<CreateJobPostResponse> => {
    const { data } = await axiosInstance.post<CreateJobPostResponse>('/job-posts', payload);
    return data;
  },

  updateJobPost: async (
    id: string,
    payload: Partial<CreateJobPostRequest>,
  ): Promise<CreateJobPostResponse> => {
    const { data } = await axiosInstance.patch<CreateJobPostResponse>(`/job-posts/${id}`, payload);
    return data;
  },

  closeJobPost: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(`/job-posts/${id}`);
    return data;
  },
};
