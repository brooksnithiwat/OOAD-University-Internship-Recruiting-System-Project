import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/auth';
import { useJobPost } from '../hooks/useJobPosts';
import { useJobApplicants, useUpdateApplicationStatus } from '../hooks/useApplications';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import { StatusUpdateDropdown } from '../components/applications/StatusUpdateDropdown';
import { readApplicationErrorMessage, type ApplicantRecord } from '../services/application.service';

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

const formatResumeUrl = (fileRef: string) => {
  if (fileRef.startsWith('http://') || fileRef.startsWith('https://')) {
    return fileRef;
  }

  const base = import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, '') ?? '';
  const filePath = fileRef.replace(/^\//, '');
  return base ? `${base}/${filePath}` : `/${filePath}`;
};

const getStudentName = (student: ApplicantRecord['student']) => `${student.firstName} ${student.lastName}`.trim();

export const ApplicantListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { data: jobPost, isLoading: isJobLoading, isError: isJobError, error: jobError } = useJobPost(id);
  const { data: applicants = [], isLoading: isApplicantsLoading, isError, error, refetch } = useJobApplicants(id);
  const updateStatusMutation = useUpdateApplicationStatus(id);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!isLoading && user?.role && user.role !== 'EMPLOYER') {
      navigate('/jobs', { replace: true });
    }
  }, [isLoading, navigate, user?.role]);

  const addToast = (type: ToastItem['type'], message: string) => {
    const idValue = Date.now();
    setToasts((current) => [...current, { id: idValue, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== idValue));
    }, 3000);
  };

  const sortedApplicants = useMemo(
    () => [...applicants].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    [applicants],
  );

  const handleStatusUpdate = async (applicationId: string, nextStatus: ApplicantRecord['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ applicationId, status: nextStatus });
      addToast('success', 'Application status updated successfully');
      await refetch();
    } catch (statusError) {
      addToast('error', readApplicationErrorMessage(statusError, 'Failed to update application status'));
    }
  };

  if (isLoading || isJobLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="h-10 w-72 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-96 animate-pulse rounded bg-gray-100" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isJobError || !jobPost) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {readApplicationErrorMessage(jobError, 'Job post not found')}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Applicant list</p>
              <h1 className="text-3xl font-bold text-gray-900">{jobPost.title}</h1>
              <p className="text-sm text-gray-600">Applicants for {jobPost.employer.companyName}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Job Detail
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
              {readApplicationErrorMessage(error, 'Unable to load applicants')}
            </div>
          )}

          {isApplicantsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : sortedApplicants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">No applicants yet</h2>
              <p className="mt-2 text-sm text-gray-600">Applications for this internship will appear here once students submit them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Faculty</th>
                    <th className="px-4 py-3">GPA</th>
                    <th className="px-4 py-3">Submission Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedApplicants.map((application) => (
                    <tr key={application.applicationId} className="align-top">
                      <td className="px-4 py-4 font-medium text-gray-900">{getStudentName(application.student)}</td>
                      <td className="px-4 py-4 text-gray-700">{application.student.faculty}</td>
                      <td className="px-4 py-4 text-gray-700">{application.student.gpa.toFixed(2)}</td>
                      <td className="px-4 py-4 text-gray-700">{formatDate(application.submittedAt)}</td>
                      <td className="px-4 py-4"><ApplicationStatusBadge status={application.status} /></td>
                      <td className="px-4 py-4">
                        {application.resume ? (
                          <a
                            href={formatResumeUrl(application.resume.fileRef)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-blue-600 underline hover:text-blue-800"
                          >
                            {application.resume.fileName}
                          </a>
                        ) : (
                          <span className="text-gray-500">No resume</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusUpdateDropdown
                          currentStatus={application.status}
                          disabled={updateStatusMutation.isPending}
                          onRequestUpdate={(nextStatus) => handleStatusUpdate(application.applicationId, nextStatus)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApplicantListPage;