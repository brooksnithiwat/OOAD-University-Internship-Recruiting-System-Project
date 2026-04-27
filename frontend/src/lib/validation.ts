import type { LoginCredentials, RegisterData, StudentRegisterData, EmployerRegisterData, ValidationError } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const STUDENT_CODE_REGEX = /^\d{11}$/;

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

export const validateStudentRegister = (data: StudentRegisterData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.studentCode.trim()) {
    errors.push({ field: 'studentCode', message: 'Student code is required' });
  } else if (!STUDENT_CODE_REGEX.test(data.studentCode)) {
    errors.push({ field: 'studentCode', message: 'Student code must be 11 digits' });
  }

  if (!data.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!data.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!data.faculty.trim()) {
    errors.push({ field: 'faculty', message: 'Faculty is required' });
  }

  if (!data.department.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  if (!data.academicYear.trim()) {
    errors.push({ field: 'academicYear', message: 'Academic year is required' });
  } else {
    const yearNum = parseInt(data.academicYear);
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 6) {
      errors.push({ field: 'academicYear', message: 'Academic year must be between 1 and 6' });
    }
  }

  if (!data.gpa.trim()) {
    errors.push({ field: 'gpa', message: 'GPA is required' });
  } else {
    const gpaNum = parseFloat(data.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      errors.push({ field: 'gpa', message: 'GPA must be between 0 and 4' });
    }
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

export const validateEmployerRegister = (data: EmployerRegisterData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.companyName.trim()) {
    errors.push({ field: 'companyName', message: 'Company name is required' });
  }

  if (!data.industry.trim()) {
    errors.push({ field: 'industry', message: 'Industry is required' });
  }

  if (!data.website.trim()) {
    errors.push({ field: 'website', message: 'Website is required' });
  } else if (!data.website.match(/^https?:\/\/.+/)) {
    errors.push({ field: 'website', message: 'Website must start with http:// or https://' });
  }

  if (!data.contactName.trim()) {
    errors.push({ field: 'contactName', message: 'Contact name is required' });
  }

  if (!data.contactPhone.trim()) {
    errors.push({ field: 'contactPhone', message: 'Contact phone is required' });
  } else if (!data.contactPhone.match(/^\d{10,}$/)) {
    errors.push({ field: 'contactPhone', message: 'Phone must be at least 10 digits' });
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
