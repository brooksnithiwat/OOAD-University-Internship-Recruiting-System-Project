import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useCoordinatorStudents } from '../../hooks/useCoordinator';
import { StudentEligibilityTable } from '../../components/coordinator/StudentEligibilityTable';
import { useAuth } from '../../contexts/auth';

export const CoordinatorStudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: students = [], isLoading, error } = useCoordinatorStudents();
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Wait for auth to load from localStorage
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>;
  }

  // Check authorization - now user should be populated
  if (!user || user.role !== 'UNIVERSITY_COORDINATOR') {
    navigate('/jobs');
    return null;
  }

  const handleToggleSuccess = () => {
    setToastMessage({
      type: 'success',
      message: 'Student eligibility updated successfully',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleError = (error: string) => {
    setToastMessage({
      type: 'error',
      message: error,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/coordinator')}
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
              <h1 className="text-4xl font-bold text-gray-900">Student Eligibility Management</h1>
              <p className="text-gray-600 mt-2">Review and update student eligibility status</p>
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
          <StudentEligibilityTable
            students={students}
            isLoading={isLoading}
            onToggleSuccess={handleToggleSuccess}
            onToggleError={handleToggleError}
          />
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
    </> 
  );
};
