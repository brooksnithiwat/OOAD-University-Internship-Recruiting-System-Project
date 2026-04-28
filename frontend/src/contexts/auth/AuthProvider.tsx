import React, { useEffect, useState } from 'react';
import { AuthContext, AuthContextType, User } from './AuthContext';
import { authStorage } from './authStorage';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = authStorage.getToken();
    const storedRole = authStorage.getUserRole();
    const storedUserId = authStorage.getUserId();
    const storedEmail = authStorage.getUserEmail();

    console.log('🔍 AuthProvider init - Token:', !!storedToken, 'Role:', storedRole, 'UserId:', storedUserId, 'Email:', storedEmail);

    if (storedToken && storedRole && storedUserId) {
      setUser({
        userId: storedUserId,
        email: storedEmail || undefined,
        role: storedRole as User['role'],
      });
      setToken(storedToken);
      console.log('✅ Auth restored from localStorage');
    } else {
      console.log('❌ No auth data in localStorage');
    }

    setIsLoading(false);
  }, []);

  const login = (newUser: User, newToken: string) => {
    console.log('🔐 Logging in user:', newUser.userId);
    setUser(newUser);
    setToken(newToken);

    // Save to localStorage
    authStorage.setToken(newToken);
    authStorage.setUserRole(newUser.role);
    authStorage.setUserId(newUser.userId);
    if (newUser.email) {
      authStorage.setUserEmail(newUser.email);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out');
    authStorage.clearAll();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
