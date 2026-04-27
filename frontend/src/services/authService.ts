import * as api from './api';
import type { ApiError } from './api';
import type { User, LoginCredentials, StudentRegisterData, EmployerRegisterData, AuthResponse } from '@/types/auth';

const TOKEN_KEY = 'AUTH_TOKEN';
const USER_ROLE_KEY = 'USER_ROLE';
const USER_ID_KEY = 'USER_ID';

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error && error.name === 'ApiError';
};

export const registerStudent = async (data: StudentRegisterData): Promise<{ userId: string }> => {
  try {
    const payload = {
      email: data.email,
      password: data.password,
      studentCode: data.studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      faculty: data.faculty,
      department: data.department,
      academicYear: parseInt(data.academicYear),
      gpa: parseFloat(data.gpa),
    };
    console.log('📤 Sending student register request:', payload);
    const response = await api.post<{ message: string; userId: string }>('/auth/register/student', payload);
    console.log('✅ Student register response received:', response);

    return { userId: response.userId };
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw new api.ApiError('Student registration failed', 500);
  }
};

export const registerEmployer = async (data: EmployerRegisterData): Promise<{ userId: string }> => {
  try {
    const payload = {
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      industry: data.industry,
      website: data.website,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
    };
    console.log('📤 Sending employer register request:', payload);
    const response = await api.post<{ message: string; userId: string }>('/auth/register/employer', payload);
    console.log('✅ Employer register response received:', response);

    return { userId: response.userId };
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw new api.ApiError('Employer registration failed', 500);
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('📤 Sending login request:', credentials);
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    console.log('✅ Login response received:', response);

    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_ROLE_KEY, response.role);
    localStorage.setItem(USER_ID_KEY, response.userId);

    return response;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw new api.ApiError('Login failed', 500);
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUserRole = (): string | null => {
  return localStorage.getItem(USER_ROLE_KEY);
};

export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY);
};

export const getProfile = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>('/auth/me');
    return response;
  } catch (error) {
    if (isApiError(error)) {
      console.error('Failed to fetch profile:', error.message);
    }
    return null;
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

