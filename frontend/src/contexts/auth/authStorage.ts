// Storage keys
const TOKEN_KEY = 'AUTH_TOKEN';
const USER_ROLE_KEY = 'USER_ROLE';
const USER_ID_KEY = 'USER_ID';
const USER_EMAIL_KEY = 'USER_EMAIL';

export const authStorage = {
  // Get methods
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserRole: (): string | null => {
    return localStorage.getItem(USER_ROLE_KEY);
  },

  getUserId: (): string | null => {
    return localStorage.getItem(USER_ID_KEY);
  },

  getUserEmail: (): string | null => {
    return localStorage.getItem(USER_EMAIL_KEY);
  },

  // Set methods
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  setUserRole: (role: string): void => {
    localStorage.setItem(USER_ROLE_KEY, role);
  },

  setUserId: (userId: string): void => {
    localStorage.setItem(USER_ID_KEY, userId);
  },

  setUserEmail: (email: string): void => {
    localStorage.setItem(USER_EMAIL_KEY, email);
  },

  // Clear all
  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  },
};
