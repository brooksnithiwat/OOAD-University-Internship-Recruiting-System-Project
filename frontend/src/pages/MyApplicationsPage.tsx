import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/auth';
import { useMyApplications, useWithdrawApplication } from '../hooks/useApplications';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import { WithdrawButton } from '../components/applications/WithdrawButton';
import { readApplicationErrorMessage, type MyApplicationRecord } from '../services/application.service';

type ToastItem = {
  id: number;
  type: 'success' | 'error';
  message: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getStatusLabel = (status: MyApplicationRecord['status']) => status.replace(/_/g, ' ');

export const MyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { data, isLoading: isApplicationsLoading, isError, error, refetch } = useMyApplications();
  const withdrawMutation = useWithdrawApplication();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!isLoading && user?.role && user.role !== 'STUDENT') {
      navigate('/jobs', { replace: true });
    }
  }, [isLoading, navigate, user?.role]);

  const addToast = (type: ToastItem['type'], message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await withdrawMutation.mutateAsync({ applicationId });
      addToast('success', 'Application withdrawn successfully');
      await refetch();
    } catch (withdrawError) {
      addToast('error', readApplicationErrorMessage(withdrawError, 'Cannot withdraw application'));
    }
  };

  const sortedApplications = useMemo(
    () => [...(data ?? [])].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    [data],
  );

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50"><Header /><div className="mx-auto max-w-5xl px-4 py-8">Loading...</div></div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-600">Track every internship application you have submitted.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
                          className="mb-6 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Job Board
            </button>
          </div>

          {toasts.length > 0 && (
            <div className="fixed right-4 top-4 z-50 space-y-2">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className={`min-w-72 rounded-xl border px-4 py-3 text-sm shadow-lg ${
                    toast.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {toast.message}
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              {readApplicationErrorMessage(error, 'Unable to load applications')}
            </div>
          )}

          {isApplicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : sortedApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">No applications yet</h2>
              <p className="mt-2 text-sm text-gray-600">
                Browse internships and submit your first application to see it here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Explore Job Board
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map((application) => {
                const canWithdraw = application.status === 'PENDING' || application.status === 'INTERVIEW_REQUEST';

                return (
                  <article key={application.applicationId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900">{application.jobPost.title}</h2>
                        <p className="text-sm text-gray-600">{application.jobPost.companyName}</p>
                        <p className="mt-2 text-sm text-gray-500">Submitted on {formatDate(application.submittedAt)}</p>
                        <p className="text-sm text-gray-500">Deadline: {formatDate(application.jobPost.applicationDeadline)}</p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <ApplicationStatusBadge status={application.status} />
                        {canWithdraw ? (
                          <WithdrawButton
                            disabled={withdrawMutation.isPending}
                            onWithdraw={() => handleWithdraw(application.applicationId)}
                          />
                        ) : (
                          <span className="text-sm text-gray-500">{getStatusLabel(application.status)}</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyApplicationsPage;