import React, { useEffect } from 'react';
import { useAuth } from '../contexts/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import ResumeUploadZone from '../components/resumes/ResumeUploadZone';
import ResumeList from '../components/resumes/ResumeList';

const ResumePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user?.role && user.role !== 'STUDENT') {
      navigate('/jobs', { replace: true });
    }
  }, [isLoading, navigate, user?.role]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-32 bg-gray-100 animate-pulse rounded mb-6" />
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-3" />
        <div className="h-24 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your Resumes</h1>
        <p className="text-sm text-gray-500">Manage and upload your resume PDF files.</p>
      </div>

      <div className="mb-6">
        <ResumeUploadZone />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Uploaded Resumes</h2>
        <ResumeList />
      </div>
    </div>
  );
};

export default ResumePage;
