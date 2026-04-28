export type User = {
  id: string;
  email: string;
  userId: string;
  role: 'STUDENT' | 'EMPLOYER' | 'UNIVERSITY_COORDINATOR' | 'DEPARTMENT_HEAD' | 'SYSTEM_ADMINISTRATOR';
  profile?: StudentProfile | EmployerProfile;
};

export type StudentProfile = {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  gpa: number;
  faculty: string;
  department: string;
  academicYear: number;
  eligibilityStatus: 'PENDING' | 'ELIGIBLE' | 'INELIGIBLE';
};

export type EmployerProfile = {
  employerId: string;
  companyName: string;
  industry: string;
  website: string;
  contactName: string;
  contactPhone: string;
  isVerified: boolean;
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

export type StudentRegisterData = {
  email: string;
  password: string;
  confirmPassword: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  faculty: string;
  department: string;
  academicYear: string;
  gpa: string;
};

export type EmployerRegisterData = {
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  industry: string;
  website: string;
  contactName: string;
  contactPhone: string;
};

export type AuthResponse = {
  accessToken: string;
  role: string;
  userId: string;
  email?: string;
  gpa?: number;
};

export type RegisterResponse = {
  message: string;
  userId: string;
};

export type ValidationError = {
  field: string;
  message: string;
};
