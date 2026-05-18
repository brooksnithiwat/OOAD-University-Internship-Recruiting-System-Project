import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartmentStudents } from '../../hooks/useDepartment';
import { DepartmentStudentTable } from '../../components/department/DepartmentStudentTable';
import { useAuth } from '../../contexts/auth';

export const DepartmentStudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: students = [], isLoading, error } = useDepartmentStudents();
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Check authorization
  if (user?.role !== 'DEPARTMENT_HEAD') {
    navigate('/jobs');
    return null;
  }

  const handleApproveSuccess = () => {
    setToastMessage({
      type: 'success',
      message: 'Student approved successfully',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveError = (error: string) => {
    setToastMessage({
      type: 'error',
      message: error,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Department Students</h1>
              <p className="text-gray-600 mt-2">Approve eligible students in your department</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'Failed to load students'}
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <DepartmentStudentTable students={students} isLoading={isLoading} />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div
            className={`p-4 rounded-lg shadow-lg text-white ${
              toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toastMessage.message}
          </div>
        </div>
      )}
    </div>
  );
};
