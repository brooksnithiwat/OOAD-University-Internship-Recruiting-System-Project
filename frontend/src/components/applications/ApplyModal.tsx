import { useEffect, useMemo, useState } from 'react';
import { useMyResumes } from '../../hooks/useResumes';
import { useSubmitApplication } from '../../hooks/useApplications';
import { readApplicationErrorMessage } from '../../services/application.service';
import type { ResumeRecord } from '../../services/resume.service';

type ApplyModalProps = {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  companyName: string;
  minGpa: number;
  studentGpa?: number;
  onClose: () => void;
  onSubmitted: () => void;
  onError: (message: string) => void;
};

const getResumeLabel = (resume: ResumeRecord) =>
  `${resume.fileName}${resume.virusScanStatus !== 'CLEAN' ? ` (${resume.virusScanStatus.toLowerCase()})` : ''}`;

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  jobId,
  jobTitle,
  companyName,
  minGpa,
  studentGpa,
  onClose,
  onSubmitted,
  onError,
}) => {
  const submitApplicationMutation = useSubmitApplication();
  const { data: resumes = [], isLoading: isLoadingResumes } = useMyResumes();
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const gpaIsBelow = typeof studentGpa === 'number' && studentGpa < minGpa;
  const hasResumes = resumes.length > 0;

  const cleanOrLatestResume = useMemo(() => {
    if (!resumes.length) {
      return '';
    }

    const cleanResume = resumes.find((resume) => resume.virusScanStatus === 'CLEAN');
    return (cleanResume ?? resumes[0]).resumeId;
  }, [resumes]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedResumeId('');
      return;
    }

    if (cleanOrLatestResume && !selectedResumeId) {
      setSelectedResumeId(cleanOrLatestResume);
    }
  }, [cleanOrLatestResume, isOpen, selectedResumeId]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedResumeId) {
      onError('Please select a resume before applying');
      return;
    }

    try {
      await submitApplicationMutation.mutateAsync({
        jobId,
        resumeId: selectedResumeId,
      });

      onSubmitted();
      onClose();
    } catch (error) {
      const message = readApplicationErrorMessage(error, 'Failed to submit application');
      onError(
        message === 'Student has already applied to this job'
          ? 'You have already applied to this job'
          : message === 'Student is not eligible to apply'
            ? 'You are not eligible to apply. Please contact your coordinator.'
            : message,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Apply to internship</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{jobTitle}</h2>
          <p className="text-sm text-gray-600">{companyName}</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {gpaIsBelow && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              Your GPA ({studentGpa?.toFixed(2)}) is below the requirement ({minGpa.toFixed(2)}), but you can still apply.
            </div>
          )}

          {isLoadingResumes ? (
            <div className="space-y-3">
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ) : !hasResumes ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-700">
              <p className="font-medium text-gray-900">You have no resume uploaded yet.</p>
              <a href="/profile/resumes" className="mt-2 inline-flex text-blue-600 underline hover:text-blue-800">
                Go to your resumes
              </a>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Select resume</label>
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                {resumes.map((resume) => (
                  <label
                    key={resume.resumeId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                      selectedResumeId === resume.resumeId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resume"
                      value={resume.resumeId}
                      checked={selectedResumeId === resume.resumeId}
                      onChange={() => setSelectedResumeId(resume.resumeId)}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{getResumeLabel(resume)}</p>
                      <p className="text-xs text-gray-500">{resume.mimeType}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasResumes || !selectedResumeId || submitApplicationMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitApplicationMutation.isPending ? 'Submitting...' : 'Confirm Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;