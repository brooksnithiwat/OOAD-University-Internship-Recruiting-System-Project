import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BackToAdminDashboardLink } from '@/components/admin/BackToAdminDashboardLink';
import { Header } from '@/components/Header';
import { useUsers } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/auth';
import { SearchBox } from '@/components/ui/SearchBox';

const formatDateTime = (dateText: string): string => {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const UsersPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchEmail, setSearchEmail] = useState('');

  const userFilters = useMemo(
    () => ({
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      search: searchEmail.trim() || undefined,
    }),
    [roleFilter, searchEmail],
  );

  const { data: users = [], isLoading, isError } = useUsers(userFilters);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user?.role !== 'SYSTEM_ADMINISTRATOR') {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <BackToAdminDashboardLink />
          <div className="py-6 mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 text-gray-600">All users registered in the system.</p>
            </div>

            

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                Total: {isLoading ? '-' : users.length}
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
            <SearchBox
              id="search"
              label="Search by email"
              placeholder="example@gmail.com"
              value={searchEmail}
              onChange={setSearchEmail}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Filter by role</label>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="ALL">All roles</option>
                <option value="SYSTEM_ADMINISTRATOR">System Administrator</option>
                <option value="EMPLOYER">Employer</option>
                <option value="STUDENT">Student</option>
                <option value="UNIVERSITY_COORDINATOR">University Coordinator</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
              </select>
            </div>
          </div>

          {isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load users. Please refresh and try again.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-gray-800">No users found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Academic Year
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Faculty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((item) => (
                      <tr key={item.userId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.department ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.academicYear ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.faculty ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
