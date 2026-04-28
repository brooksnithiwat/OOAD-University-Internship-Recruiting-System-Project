import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useAuthForm } from '@/hooks/useAuthForm';
import { validateLogin } from '@/lib/validation';
import { login } from '@/services/authService';
import { isApiError } from '@/services/authService';
import type { LoginCredentials } from '@/types/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { formValues, formErrors, isLoading, setIsLoading, handleChange, setErrors } =
    useAuthForm<LoginCredentials>({
      email: '',
      password: '',
    });
  const [apiError, setApiError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');

    const validationErrors = validateLogin(formValues);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(formValues);

      authContext.login(
        {
          userId: response.userId,
          email: response.email,
          role: response.role as any,
          gpa: response.gpa,
        },
        response.accessToken,
      );

      navigate('/jobs');
    } catch (error) {
      if (isApiError(error)) {
        setApiError(error.message || 'Login failed');
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-blue-200 rounded-lg shadow-sm p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-center text-dark-blue mb-2 font-castoro">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            className="flex-1 py-2 px-4 font-medium rounded-lg transition-colors bg-blue-600 text-white"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="flex-1 py-2 px-4 font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {apiError}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formValues.email}
              placeholder="you@example.com"
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formValues.password}
              placeholder="••••••••"
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
