import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { Header } from '../components/Header';
import { CreateJobForm } from '../components/jobs/CreateJobForm';
import { useJobPost, useUpdateJobPost } from '../hooks/useJobPosts';
import { CreateJobPostRequest } from '../services/jobPost.service';

const getUpdateJobPostErrorMessage = (error: unknown) => {
  const fallbackMessage = 'Error updating job post. Please try again.';

  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return apiError.response?.data?.message ?? fallbackMessage;
};

export const EditJobPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: jobDetail, isLoading, isError } = useJobPost(id);
  const updateJobPost = useUpdateJobPost(id || '');

  if (user?.role !== 'EMPLOYER') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              ❌ Only employers can edit job posts.
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go to Job Board
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !jobDetail) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              ❌ Job post not found.
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go to Job Board
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (data: CreateJobPostRequest) => {
    await updateJobPost.mutateAsync(data);
    navigate(`/jobs/${id}`);
  };

  // Transform jobDetail to match CreateJobForm's expected type
  const transformedJobDetail = jobDetail ? {
    ...jobDetail,
    location: jobDetail.location ?? undefined,
  } : undefined;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="mb-6 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← Back to Job Detail
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Internship</h1>
          <p className="text-gray-600 mb-8">
            Update the details of your internship opportunity.
          </p>

          <div className="bg-white rounded-lg shadow-md p-8">
            {updateJobPost.isError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                ❌ {getUpdateJobPostErrorMessage(updateJobPost.error)}
              </div>
            )}

            <CreateJobForm
              onSubmit={handleSubmit}
              initialData={transformedJobDetail}
              isLoading={updateJobPost.isPending}
              isEdit={true}
            />

            <button
              onClick={() => navigate(`/jobs/${id}`)}
              type="button"
              className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
