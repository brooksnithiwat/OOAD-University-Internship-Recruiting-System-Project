import { useState } from 'react';
import { CreateJobForm } from './CreateJobForm';
import { CreateJobPostRequest, JobPostDetail } from '../../services/jobPost.service';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDetail: JobPostDetail | undefined;
  onSubmit: (data: Partial<CreateJobPostRequest>) => Promise<void>;
  isLoading?: boolean;
}

export const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  onClose,
  jobDetail,
  onSubmit,
  isLoading,
}) => {
  const [hasDeadlineWarning, setHasDeadlineWarning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (data: CreateJobPostRequest) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDeadline = new Date(data.applicationDeadline);

    if (newDeadline < today && newDeadline.toDateString() !== jobDetail?.applicationDeadline) {
      setHasDeadlineWarning(true);
      return;
    }

    setHasDeadlineWarning(false);
    await onSubmit(data);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Edit Job Post</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            {hasDeadlineWarning && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
                ⚠️ The new deadline is in the past. Please select a future date.
              </div>
            )}

            <CreateJobForm
              onSubmit={handleSubmit}
              initialData={
                jobDetail
                  ? {
                      title: jobDetail.title,
                      description: jobDetail.description,
                      location: jobDetail.location || '',
                      minGpa: jobDetail.minGpa,
                      durationWeeks: jobDetail.durationWeeks,
                      applicationDeadline: jobDetail.applicationDeadline,
                      skills: jobDetail.skills,
                    }
                  : undefined
              }
              isLoading={isLoading}
              isEdit
            />
          </div>
        </div>
      </div>
    </>
  );
};
