import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllUsers } from '../../hooks/useAdminUsers';
import { UserTable } from '../../components/admin/UserTable';
import { CreateStaffModal } from '../../components/admin/CreateStaffModal';
import { AuthContext } from '../../contexts/AuthContext';
import axios from '../../lib/axios';

interface Department {
  id: string;
  name: string;
}

export const AdminUserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { data: users = [], isLoading, error } = useAllUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Check authorization
  if (authContext?.user?.role !== 'SYSTEM_ADMINISTRATOR') {
    navigate('/jobs');
    return null;
  }

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get<Department[]>('/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to load departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleCreateSuccess = () => {
    setToastMessage({
      type: 'success',
      message: 'Staff account created successfully',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateError = (error: string) => {
    setToastMessage({
      type: 'error',
      message: error,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeactivateSuccess = () => {
    setToastMessage({
      type: 'success',
      message: 'User deactivated successfully',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeactivateError = (error: string) => {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage staff accounts and permissions</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Staff Account
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Users</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Active Users</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {users.filter((u) => u.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Inactive Users</p>
            <p className="text-4xl font-bold text-gray-600 mt-2">
              {users.filter((u) => u.status === 'INACTIVE').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <UserTable
            users={users}
            isLoading={isLoading}
            currentUserId={authContext?.user?.id || ''}
            onDeactivateSuccess={handleDeactivateSuccess}
            onDeactivateError={handleDeactivateError}
          />
        </div>
      </div>

      {/* Create Staff Modal */}
      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
        departments={departments}
      />

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
