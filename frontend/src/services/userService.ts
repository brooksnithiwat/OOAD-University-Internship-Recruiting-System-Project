import * as api from './api';

export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

export type CreateUserPayload = {
  email: string;
  name?: string;
};

export const getUsers = async (): Promise<User[]> => {
  return api.get<User[]>('/users');
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  return api.post<User>('/users', payload);
};
