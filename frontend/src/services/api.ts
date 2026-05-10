import axios, { AxiosError } from 'axios';
import type { ApiErrorData } from '@/types/api';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export class ApiError extends Error {
  name = 'ApiError';
  status: number;
  data: ApiErrorData;

  constructor(message: string, status: number = 500, data: ApiErrorData = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  // Read the standardized token key used by authStorage
  const token = localStorage.getItem('AUTH_TOKEN') || localStorage.getItem('accessToken') || localStorage.getItem('TOKEN_KEY');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const post = async <T,>(url: string, data: unknown): Promise<T> => {
  try {
    const response = await axiosInstance.post<T>(url, data);
    console.log(`📡 POST ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const message = axiosError.response?.statusText || 'Request failed';
    const status = axiosError.response?.status || 500;
    throw new ApiError(message, status, axiosError.response?.data as ApiErrorData);
  }
};

export const get = async <T,>(url: string): Promise<T> => {
  try {
    const response = await axiosInstance.get<T>(url);
    console.log(`📡 GET ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const message = axiosError.response?.statusText || 'Request failed';
    const status = axiosError.response?.status || 500;
    throw new ApiError(message, status, axiosError.response?.data as ApiErrorData);
  }
};
