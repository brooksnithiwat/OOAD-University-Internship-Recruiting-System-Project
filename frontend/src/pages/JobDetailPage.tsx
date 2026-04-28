import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { Header } from '../components/Header';
import { useJobPost, useUpdateJobPost, useCloseJobPost } from '../hooks/useJobPosts';
import { EditJobModal } from '../components/jobs/EditJobModal';
import { JobSkillBadge } from '../components/jobs/JobSkillBadge';
import { CreateJobPostRequest } from '../services/jobPost.service';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: jobDetail, isLoading, isError } = useJobPost(id);
  const updateJobPost = useUpdateJobPost(id || '');
  const closeJobPost = useCloseJobPost(id || '');

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-4xl mx-auto">
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              Job post not found.
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Job Board
            </button>
          </div>
        </div>
      </>
    );
  }

  const isOwner = user?.userId === jobDetail.employer.companyName; // Assume employer check
  const isStudent = user?.role === 'STUDENT';
  const gpaIsBelow = isStudent && user?.gpa && user.gpa < jobDetail.minGpa;

  const handleUpdateJobPost = async (data: Partial<CreateJobPostRequest>) => {
    await updateJobPost.mutateAsync(data);
    setShowEditModal(false);
  };

  const handleCloseJobPost = async () => {
    if (window.confirm('Are you sure you want to close this job post?')) {
      await closeJobPost.mutateAsync();
      navigate('/jobs');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Job Board
          </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobDetail.title}</h1>
              <p className="text-lg text-gray-600">{jobDetail.employer.companyName}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                jobDetail.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {jobDetail.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-y border-gray-200">
            {jobDetail.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-900">{jobDetail.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Min GPA</p>
              <p className="font-semibold text-gray-900">{jobDetail.minGpa.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">{jobDetail.durationWeeks} weeks</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="font-semibold text-gray-900">
                {new Date(jobDetail.applicationDeadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          {gpaIsBelow && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
              ⚠️ Your GPA ({user?.gpa?.toFixed(2)}) is below the requirement ({jobDetail.minGpa.toFixed(2)}), but you can still apply.
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{jobDetail.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {jobDetail.skills.map((skill: string, index: number) => (
                <JobSkillBadge
                  key={skill}
                  skill={skill}
                  variant={(['primary', 'secondary', 'tertiary'] as const)[index % 3]}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Employer Information</h3>
            <p className="text-gray-700">
              <span className="font-medium">Company:</span> {jobDetail.employer.companyName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Industry:</span> {jobDetail.employer.industry || 'N/A'}
            </p>
            {jobDetail.employer.website && (
              <p className="text-gray-700">
                <span className="font-medium">Website:</span>{' '}
                <a
                  href={jobDetail.employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {jobDetail.employer.website}
                </a>
              </p>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {isStudent && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Now
              </button>
            )}

            {isOwner && jobDetail.status === 'ACTIVE' && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Edit Job Post
                </button>
                <button
                  onClick={handleCloseJobPost}
                  disabled={closeJobPost.isPending}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {closeJobPost.isPending ? 'Closing...' : 'Close Job Post'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <EditJobModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        jobDetail={jobDetail}
        onSubmit={handleUpdateJobPost}
        isLoading={updateJobPost.isPending}
      />
    </div>
    </>
  );
};
