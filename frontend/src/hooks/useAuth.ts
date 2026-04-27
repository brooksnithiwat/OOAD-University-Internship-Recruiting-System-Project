import { useState, useCallback } from 'react';
import { getToken, getUserRole, getUserId, clearAuth } from '@/services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [userRole, setUserRole] = useState<string | null>(getUserRole());
  const [userId, setUserId] = useState<string | null>(getUserId());

  const logout = useCallback(() => {
    clearAuth();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  }, []);

  const setAuthenticatedUser = useCallback((role: string, userId: string) => {
    setUserRole(role);
    setUserId(userId);
    setIsAuthenticated(true);
  }, []);

  return {
    isAuthenticated,
    userRole,
    userId,
    logout,
    setAuthenticatedUser,
  };
};
