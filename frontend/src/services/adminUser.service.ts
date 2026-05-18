import axios from '../lib/axios';

export type UserRole = 'STUDENT' | 'EMPLOYER' | 'UNIVERSITY_COORDINATOR' | 'DEPARTMENT_HEAD' | 'SYSTEM_ADMINISTRATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  role: 'UNIVERSITY_COORDINATOR' | 'DEPARTMENT_HEAD';
}

export interface DeactivatePayload {
  reason?: string;
}

export interface UserCreateResponse extends User {
  tempPassword?: string;
}

export const adminUserService = {
  /**
   * Fetch all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get<User[]>('/admin/users');
    return response.data;
  },

  /**
   * Create a new staff user (Coordinator or Department Head)
   */
  async createStaffUser(payload: CreateStaffPayload): Promise<UserCreateResponse> {
    const response = await axios.post<UserCreateResponse>('/admin/users', payload);
    return response.data;
  },

  /**
   * Deactivate a user
   */
  async deactivateUser(userId: string, payload?: DeactivatePayload): Promise<User> {
    const response = await axios.patch<User>(
      `/admin/users/${userId}/deactivate`,
      payload || {}
    );
    return response.data;
  },
};
