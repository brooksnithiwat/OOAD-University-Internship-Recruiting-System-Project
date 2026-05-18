import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useDepartmentStudents, useDownloadInternshipReport } from '../../hooks/useDepartment';
import { coordinatorService } from '../../services/coordinator.service';
import { useAuth } from '../../contexts/auth';

export const DepartmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: students = [], isLoading } = useDepartmentStudents();
  const downloadMutation = useDownloadInternshipReport();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'DEPARTMENT_HEAD') {
    navigate('/jobs');
    return null;
  }

  const stats = coordinatorService.calculateStats(students);

  const handleDownloadReport = async () => {
    try {
      await downloadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Department Head Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage student eligibility and view internship placements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Students</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M13 10h.01M11 10h.01M9 10h.01M7 10h.01M5 11a2 2 0 11-4 0 2 2 0 014 0zM16 16a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Approved Students</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats.eligible}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Awaiting Approval</p>
                  <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

            <button
              onClick={handleDownloadReport}
              disabled={downloadMutation.isPending}
              className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-900">Export Internship Report</p>
                <p className="text-sm text-gray-600">Download CSV with all student internship placements</p>
              </div>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
