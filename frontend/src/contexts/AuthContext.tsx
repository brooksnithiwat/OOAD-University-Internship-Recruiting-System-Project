import React, { createContext, useEffect, useState } from 'react';
import { getToken, getUserRole, getUserId, clearAuth } from '../services/authService';

const TOKEN_KEY = 'AUTH_TOKEN';
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_ROLE_KEY = 'USER_ROLE';
const USER_ID_KEY = 'USER_ID';

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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedRole = getUserRole();
    const storedUserId = getUserId();

    if (storedToken && storedRole && storedUserId) {
      setUser({
        userId: storedUserId,
        role: storedRole as User['role'],
      });
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    // Save to localStorage
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
    localStorage.setItem(USER_ROLE_KEY, newUser.role);
    localStorage.setItem(USER_ID_KEY, newUser.userId);
  };

  const logout = () => {
    clearAuth();
    // Also clear using our local constants
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
