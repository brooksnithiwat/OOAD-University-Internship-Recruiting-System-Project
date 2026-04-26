import type { LoginCredentials, RegisterData, ValidationError } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

export const validateLogin = (credentials: LoginCredentials): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!credentials.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(credentials.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!credentials.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

export const validateRegister = (data: RegisterData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.fullName.trim()) {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  }

  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
  }

  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
};
