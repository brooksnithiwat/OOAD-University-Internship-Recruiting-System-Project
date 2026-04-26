import { useState, useCallback } from 'react';
import { getUser, getToken, clearAuth } from '@/services/authService';
import type { User } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuthenticatedUser = useCallback((newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  return {
    user,
    isAuthenticated,
    logout,
    setAuthenticatedUser,
  };
};
