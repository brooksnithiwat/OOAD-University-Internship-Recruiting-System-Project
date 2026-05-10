import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '@/hooks/useAuthForm';
import { validateStudentRegister, validateEmployerRegister } from '@/lib/validation';
import { registerStudent, registerEmployer, isApiError } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { SuccessModal } from '@/components/ui/SuccessModal';
import type { StudentRegisterData, EmployerRegisterData } from '@/types/auth';

type RegisterMode = 'student' | 'employer';

const InputField = ({
  label,
  id,
  value,
  error,
  onChange,
  ...props
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<RegisterMode>('student');
  const [apiError, setApiError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const studentForm = useAuthForm<StudentRegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    studentCode: '',
    firstName: '',
    lastName: '',
    faculty: '',
    department: '',
    academicYear: '',
    gpa: '',
  });

  const employerForm = useAuthForm<EmployerRegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    website: '',
    contactName: '',
    contactPhone: '',
  });

  const handleStudentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');

    const validationErrors = validateStudentRegister(studentForm.formValues);
    if (validationErrors.length > 0) {
      studentForm.setErrors(validationErrors);
      return;
    }

    studentForm.setIsLoading(true);
    try {
      await registerStudent(studentForm.formValues);
      setSuccessMessage({
        title: 'Student Registration Successful',
        message: 'Your account has been created. Your eligibility status is set to PENDING and will be reviewed by the University Coordinator.',
      });
      setShowSuccessModal(true);
    } catch (error) {
      if (isApiError(error)) {
        setApiError(error.data?.message || error.message || 'Student registration failed');
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      studentForm.setIsLoading(false);
    }
  };

  const handleEmployerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');

    const validationErrors = validateEmployerRegister(employerForm.formValues);
    if (validationErrors.length > 0) {
      employerForm.setErrors(validationErrors);
      return;
    }

    employerForm.setIsLoading(true);
    try {
      await registerEmployer(employerForm.formValues);
      setSuccessMessage({
        title: 'Employer Registration Successful',
        message: 'Your company account has been created. Your account is currently unverified and will be reviewed by the system administrator.',
      });
      setShowSuccessModal(true);
    } catch (error) {
      if (isApiError(error)) {
        setApiError(error.data?.message || error.message || 'Employer registration failed');
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      employerForm.setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 sm:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-castoro">
              Create Account
            </h1>
            <p className="text-base text-gray-600">
              Choose your role to get started
            </p>
          </div>

          <div className="flex gap-1 mb-8 border-b border-gray-200 bg-gray-50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('student');
                setApiError('');
              }}
              className={`flex-1 py-2.5 px-4 font-medium text-sm rounded-md transition-all ${
                mode === 'student'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('employer');
                setApiError('');
              }}
              className={`flex-1 py-2.5 px-4 font-medium text-sm rounded-md transition-all ${
                mode === 'employer'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Employer
            </button>

          </div>

          {mode === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              {apiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {apiError}
                </div>
              )}

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Academic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Student Code"
                    id="studentCode"
                    type="text"
                    name="studentCode"
                    value={studentForm.formValues.studentCode}
                    error={studentForm.formErrors.studentCode}
                    onChange={studentForm.handleChange}
                    placeholder="66070503410"
                  />
                  <InputField
                    label="First Name"
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={studentForm.formValues.firstName}
                    error={studentForm.formErrors.firstName}
                    onChange={studentForm.handleChange}
                    placeholder="John"
                  />
                  <InputField
                    label="Last Name"
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={studentForm.formValues.lastName}
                    error={studentForm.formErrors.lastName}
                    onChange={studentForm.handleChange}
                    placeholder="Doe"
                  />
                  <InputField
                    label="Faculty"
                    id="faculty"
                    type="text"
                    name="faculty"
                    value={studentForm.formValues.faculty}
                    error={studentForm.formErrors.faculty}
                    onChange={studentForm.handleChange}
                    placeholder="Engineering"
                  />
                  <InputField
                    label="Department"
                    id="department"
                    type="text"
                    name="department"
                    value={studentForm.formValues.department}
                    error={studentForm.formErrors.department}
                    onChange={studentForm.handleChange}
                    placeholder="Computer Science"
                  />
                  <InputField
                    label="Academic Year"
                    id="academicYear"
                    type="text"
                    name="academicYear"
                    value={studentForm.formValues.academicYear}
                    error={studentForm.formErrors.academicYear}
                    onChange={studentForm.handleChange}
                    placeholder="3rd Year"
                  />
                  <InputField
                    label="GPA"
                    id="gpa"
                    type="text"
                    name="gpa"
                    value={studentForm.formValues.gpa}
                    error={studentForm.formErrors.gpa}
                    onChange={studentForm.handleChange}
                    placeholder="3.5"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <InputField
                    label="Email Address"
                    id="student-email"
                    type="email"
                    name="email"
                    value={studentForm.formValues.email}
                    error={studentForm.formErrors.email}
                    onChange={studentForm.handleChange}
                    placeholder="you@example.com"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Password"
                      id="student-password"
                      type="password"
                      name="password"
                      value={studentForm.formValues.password}
                      error={studentForm.formErrors.password}
                      onChange={studentForm.handleChange}
                      placeholder="••••••••"
                    />
                    <InputField
                      label="Confirm Password"
                      id="student-confirm"
                      type="password"
                      name="confirmPassword"
                      value={studentForm.formValues.confirmPassword}
                      error={studentForm.formErrors.confirmPassword}
                      onChange={studentForm.handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Note:</span> Your eligibility status will be set to PENDING and require University Coordinator approval before you can apply for internships.
                </p>
              </div>

              <Button
                type="submit"
                disabled={studentForm.isLoading}
                variant="primary"
                className="w-full"
              >
                {studentForm.isLoading ? 'Registering...' : 'Register as Student'}
              </Button>
            </form>
          )}

          {mode === 'employer' && (
            <form onSubmit={handleEmployerSubmit} className="space-y-6">
              {apiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {apiError}
                </div>
              )}

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Company Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Company Name"
                      id="companyName"
                      type="text"
                      name="companyName"
                      value={employerForm.formValues.companyName}
                      error={employerForm.formErrors.companyName}
                      onChange={employerForm.handleChange}
                      placeholder="Tech Company Inc."
                    />
                    <InputField
                      label="Industry"
                      id="industry"
                      type="text"
                      name="industry"
                      value={employerForm.formValues.industry}
                      error={employerForm.formErrors.industry}
                      onChange={employerForm.handleChange}
                      placeholder="Software Development"
                    />
                  </div>
                  <InputField
                    label="Website"
                    id="website"
                    type="text"
                    name="website"
                    value={employerForm.formValues.website}
                    error={employerForm.formErrors.website}
                    onChange={employerForm.handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Contact Name"
                    id="contactName"
                    type="text"
                    name="contactName"
                    value={employerForm.formValues.contactName}
                    error={employerForm.formErrors.contactName}
                    onChange={employerForm.handleChange}
                    placeholder="John Smith"
                  />
                  <InputField
                    label="Contact Phone"
                    id="contactPhone"
                    type="text"
                    name="contactPhone"
                    value={employerForm.formValues.contactPhone}
                    error={employerForm.formErrors.contactPhone}
                    onChange={employerForm.handleChange}
                    placeholder="0812345678"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <InputField
                    label="Email Address"
                    id="employer-email"
                    type="email"
                    name="email"
                    value={employerForm.formValues.email}
                    error={employerForm.formErrors.email}
                    onChange={employerForm.handleChange}
                    placeholder="hr@company.com"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Password"
                      id="employer-password"
                      type="password"
                      name="password"
                      value={employerForm.formValues.password}
                      error={employerForm.formErrors.password}
                      onChange={employerForm.handleChange}
                      placeholder="••••••••"
                    />
                    <InputField
                      label="Confirm Password"
                      id="employer-confirm"
                      type="password"
                      name="confirmPassword"
                      value={employerForm.formValues.confirmPassword}
                      error={employerForm.formErrors.confirmPassword}
                      onChange={employerForm.handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Note:</span> Your account will be marked as unverified and require Admin verification before you can post job listings.
                </p>
              </div>

              <Button
                type="submit"
                disabled={employerForm.isLoading}
                variant="primary"
                className="w-full"
              >
                {employerForm.isLoading ? 'Registering...' : 'Register as Employer'}
              </Button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in here
        </button>
      </p>

      <SuccessModal
        isOpen={showSuccessModal}
        title={successMessage.title}
        message={successMessage.message}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/login');
        }}
      />
    </div>
  );
};
