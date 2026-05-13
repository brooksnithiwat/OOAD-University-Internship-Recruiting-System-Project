import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { Header } from '../components/Header';
import { CreateJobForm } from '../components/jobs/CreateJobForm';
import { useCreateJobPost } from '../hooks/useJobPosts';
import { CreateJobPostRequest } from '../services/jobPost.service';

const getCreateJobPostErrorMessage = (error: unknown) => {
  const fallbackMessage = 'Error creating job post. Please try again.';

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

export const CreateJobPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createJobPost = useCreateJobPost();

  if (user?.role !== 'EMPLOYER') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              ❌ Only employers can create job posts.
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
    await createJobPost.mutateAsync(data);
    navigate('/jobs');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Internship</h1>
        <p className="text-gray-600 mb-8">
          Create an internship opportunity for students. Fill in the details below.
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          {createJobPost.isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
              ❌ {getCreateJobPostErrorMessage(createJobPost.error)}
            </div>
          )}

          <CreateJobForm onSubmit={handleSubmit} isLoading={createJobPost.isPending} />

          <button
            onClick={() => navigate('/jobs')}
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
