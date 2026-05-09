import { Link, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useUnverifiedEmployers, useTotalUsers, useActiveJobPostsCount } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/auth';

export const AdminDashboardPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: employers, isLoading: isEmployersLoading } = useUnverifiedEmployers();
  const { data: totalUsers, isLoading: isUsersLoading } = useTotalUsers();
  const { data: activeJobsCount, isLoading: isJobsLoading } = useActiveJobPostsCount();

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user?.role !== 'SYSTEM_ADMINISTRATOR') {
    return <Navigate to="/jobs" replace />;
  }

  const pendingCount = employers?.length ?? 0;
  const usersCount = totalUsers ?? 0;
  const activeCount = activeJobsCount ?? 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and verify employer registrations.</p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/admin/employers/unverified"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-500">Employers awaiting verification</p>
              {isEmployersLoading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="mt-2 text-4xl font-bold text-gray-900">{pendingCount}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">Click to review pending employer approvals.</p>
            </Link>

            <Link
              to="/admin/users"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-500">Total users</p>
              {isUsersLoading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="mt-2 text-4xl font-bold text-gray-900">{usersCount}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">Click to view all registered users.</p>
            </Link>

            <Link
              to="/jobs"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-colors hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-500">Active job posts</p>
              {isJobsLoading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="mt-2 text-4xl font-bold text-gray-900">{activeCount}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">Click to open the job board.</p>
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              to="/admin/employers/unverified"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Unverified Employers
            </Link>

            <Link
              to="/admin/users"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              User Management (Phase 5)
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
