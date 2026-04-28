import { useState } from 'react';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobCard } from '../components/jobs/JobCard';
import { Header } from '../components/Header';
import { useJobPosts } from '../hooks/useJobPosts';
import { JobPostResponse } from '../services/jobPost.service';

export const JobBoardPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minGpa: undefined,
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError } = useJobPosts(filters);

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePreviousPage = () => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  };

  const handleNextPage = () => {
    if (data && filters.page < Math.ceil(data.total / filters.limit)) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  if (isError) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              Error loading job posts. Please try again later.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Board</h1>
        <p className="text-gray-600 mb-8">
          Explore internship opportunities from verified employers
        </p>

        <JobFilters onFiltersChange={handleFiltersChange} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_: unknown, i: number) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {data?.data.map((job: JobPostResponse) => (
                <JobCard
                  key={job.jobId}
                  jobId={job.jobId}
                  title={job.title}
                  companyName={job.companyName}
                  location={job.location}
                  minGpa={job.minGpa}
                  applicationDeadline={job.applicationDeadline}
                  skills={job.skills}
                />
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0}{' '}
                jobs
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {filters.page} of {Math.ceil((data?.total || 0) / filters.limit) || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!data || filters.page >= Math.ceil((data?.total || 0) / filters.limit)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
           </div>
            </div>
          </>
        )}
      </div>
    </div>
       </>
  );
};
