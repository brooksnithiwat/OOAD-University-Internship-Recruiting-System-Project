import axiosInstance from '@/lib/axios';

export interface UnverifiedEmployer {
  employerId?: string;
  id?: string;
  email: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface UnverifiedEmployerApiItem {
  employerId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  user: {
    email: string;
    createdAt: string;
  };
}

interface UnverifiedEmployersResponse {
  data: UnverifiedEmployerApiItem[];
  total: number;
}

export interface EmployerSearchFilters {
  verificationStatus?: 'ALL' | 'APPROVED' | 'UNAPPROVED';
  search?: string;
}

export interface VerifyEmployerResponse {
  message: string;
}

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
  department: string | null;
  academicYear: number | null;
  faculty: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchFilters {
  role?: string;
  search?: string;
}

export const resolveEmployerId = (employer: UnverifiedEmployer): string => {
  const id = employer.employerId ?? employer.id;

  if (!id) {
    throw new Error('Employer id is missing from API response');
  }

  return id;
};

export const adminService = {
  getUnverifiedEmployers: async (): Promise<UnverifiedEmployer[]> => {
    const { data } = await axiosInstance.get<UnverifiedEmployersResponse>(
      '/admin/employers/unverified',
    );

    return (data.data ?? []).map((employer) => ({
      employerId: employer.employerId,
      email: employer.user?.email ?? '',
      companyName: employer.companyName,
      industry: employer.industry,
      website: employer.website,
      contactName: employer.contactName,
      contactPhone: employer.contactPhone,
      isVerified: employer.isVerified,
      createdAt: employer.user?.createdAt ?? '',
    }));
  },

  getEmployers: async (filters: EmployerSearchFilters): Promise<UnverifiedEmployer[]> => {
    const { data } = await axiosInstance.get<UnverifiedEmployersResponse>('/admin/employers', {
      params: filters,
    });

    return (data.data ?? []).map((employer) => ({
      employerId: employer.employerId,
      email: employer.user?.email ?? '',
      companyName: employer.companyName,
      industry: employer.industry,
      website: employer.website,
      contactName: employer.contactName,
      contactPhone: employer.contactPhone,
      isVerified: employer.isVerified,
      createdAt: employer.user?.createdAt ?? '',
    }));
  },

  verifyEmployer: async (employerId: string): Promise<VerifyEmployerResponse> => {
    const { data } = await axiosInstance.patch<VerifyEmployerResponse>(
      `/admin/employers/${employerId}/verify`,
    );
    return data;
  },
  getTotalUsers: async (): Promise<number> => {
    const { data } = await axiosInstance.get<AdminUser[]>('/users');
    return Array.isArray(data) ? data.length : 0;
  },

  getUsers: async (filters: UserSearchFilters): Promise<AdminUser[]> => {
    const { data } = await axiosInstance.get<AdminUser[]>('/users', {
      params: filters,
    });
    return Array.isArray(data) ? data : [];
  },

  getActiveJobPostsCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get('/job-posts', {
      params: { status: 'ACTIVE', page: 1, limit: 1 },
    });

    if (data && typeof data === 'object') {
      if (Array.isArray(data.data) && typeof data.total === 'number') {
        return data.total;
      }
      if (Array.isArray(data)) {
        return data.length;
      }
    }

    return 0;
  },
};
