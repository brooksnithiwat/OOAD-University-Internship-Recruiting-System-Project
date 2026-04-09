import { api } from './api';

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

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<User>('/users', payload);
  return response.data;
}
