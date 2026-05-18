import axiosInstance from '../lib/axios';

export const APPLICATION_STATUS_VALUES = [
  'PENDING',
  'INTERVIEW_REQUEST',
  'OFFER_SENT',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export type SubmitApplicationRequest = {
  jobId: string;
  resumeId: string;
};

export type SubmitApplicationResponse = {
  applicationId: string;
  jobId: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export type MyApplicationRecord = {
  applicationId: string;
  status: ApplicationStatus;
  submittedAt: string;
  jobPost: {
    jobId: string;
    title: string;
    companyName: string;
    applicationDeadline: string;
  };
};

export type ApplicantRecord = {
  applicationId: string;
  status: ApplicationStatus;
  submittedAt: string;
  student: {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    gpa: number;
    faculty: string;
  };
  resume: {
    resumeId: string;
    fileName: string;
    fileRef: string;
  } | null;
};

export type UpdateApplicationStatusResponse = {
  applicationId: string;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  updatedAt: string;
};

export type WithdrawApplicationResponse = {
  message: string;
};

export const submitApplication = async (
  data: SubmitApplicationRequest,
): Promise<SubmitApplicationResponse> => {
  const { data: response } = await axiosInstance.post<SubmitApplicationResponse>('/applications', data);
  return response;
};

export const getMyApplications = async (): Promise<MyApplicationRecord[]> => {
  const { data } = await axiosInstance.get<MyApplicationRecord[]>('/applications/my');
  return data;
};

export const withdrawApplication = async (
  applicationId: string,
): Promise<WithdrawApplicationResponse> => {
  const { data } = await axiosInstance.delete<WithdrawApplicationResponse>(
    `/applications/${applicationId}/withdraw`,
  );
  return data;
};

export const getJobApplicants = async (jobId: string): Promise<ApplicantRecord[]> => {
  const { data } = await axiosInstance.get<ApplicantRecord[]>(`/job-posts/${jobId}/applications`);
  return data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  note?: string,
): Promise<UpdateApplicationStatusResponse> => {
  const { data } = await axiosInstance.patch<UpdateApplicationStatusResponse>(
    `/applications/${applicationId}/status`,
    { status, note },
  );
  return data;
};

export const readApplicationErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const maybeError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    const backendMessage = maybeError.response?.data?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallback;
};

export default {
  submitApplication,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
};