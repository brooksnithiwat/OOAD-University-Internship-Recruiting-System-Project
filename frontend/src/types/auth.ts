export type User = {
  id: string;
  email: string;
  fullName: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ValidationError = {
  field: string;
  message: string;
};
