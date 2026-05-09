import { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BackToAdminDashboardLink } from '@/components/admin/BackToAdminDashboardLink';
import { Header } from '@/components/Header';
import { UnverifiedEmployerTable } from '@/components/admin/UnverifiedEmployerTable';
import { useEmployers, useVerifyEmployer } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/auth';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            toast.type === 'success'
              ? 'rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow'
              : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow'
          }
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export const UnverifiedEmployersPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'ALL' | 'APPROVED' | 'UNAPPROVED'>(
    'UNAPPROVED',
  );
  const [searchEmail, setSearchEmail] = useState('');

  const employerFilters = useMemo(
    () => ({
      verificationStatus,
      search: searchEmail.trim() || undefined,
    }),
    [verificationStatus, searchEmail],
  );

  const { data: employers = [], isLoading, isError } = useEmployers(employerFilters);
  const verifyEmployerMutation = useVerifyEmployer();

  const [approvingEmployerId, setApprovingEmployerId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const toastId = Date.now();

    setToasts((currentToasts) => [...currentToasts, { id: toastId, type, message }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
    }, 3000);
  }, []);

  const pendingCount = useMemo(() => employers.length, [employers]);

  const handleApprove = useCallback(
    async (employerId: string) => {
      try {
        setApprovingEmployerId(employerId);
        await verifyEmployerMutation.mutateAsync(employerId);
        addToast('success', 'Employer approved successfully.');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve employer.';
        addToast('error', errorMessage);
      } finally {
        setApprovingEmployerId(null);
      }
    },
    [addToast, verifyEmployerMutation],
  );

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user?.role !== 'SYSTEM_ADMINISTRATOR') {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <>
      <Header />
      <ToastContainer toasts={toasts} />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <BackToAdminDashboardLink />
          <div className="mb-6 flex flex-col gap-3 py-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Employers</h1>
              <p className="mt-1 text-gray-600">
                Review employer registrations and filter by approval status.
              </p>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                Results: {isLoading ? '-' : pendingCount}
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search by email</label>
              <input
                type="text"
                value={searchEmail}
                onChange={(event) => setSearchEmail(event.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Approval status</label>
              <select
                value={verificationStatus}
                onChange={(event) =>
                  setVerificationStatus(
                    event.target.value as 'ALL' | 'APPROVED' | 'UNAPPROVED',
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="ALL">All</option>
                <option value="APPROVED">Approved</option>
                <option value="UNAPPROVED">Unapproved</option>
              </select>
            </div>
          </div>

          <UnverifiedEmployerTable
            employers={employers}
            isLoading={isLoading}
            isError={isError}
            onApprove={handleApprove}
            approvingEmployerId={approvingEmployerId}
          />
        </div>
      </div>
    </>
  );
};
