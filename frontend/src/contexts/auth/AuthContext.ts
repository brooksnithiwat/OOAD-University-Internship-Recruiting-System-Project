import { createContext } from 'react';

export interface User {
  userId: string;
  email?: string;
  role: 'STUDENT' | 'EMPLOYER' | 'UNIVERSITY_COORDINATOR' | 'DEPARTMENT_HEAD' | 'SYSTEM_ADMINISTRATOR';
  gpa?: number;
  companyName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
