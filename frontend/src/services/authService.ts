import * as api from './api';
import type { ApiError } from './api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

const TOKEN_KEY = 'TOKEN_KEY';
const USER_KEY = 'USER_KEY';

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error && error.name === 'ApiError';
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    return response;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }
    throw new api.ApiError('Registration failed', 500);
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

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

export const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

