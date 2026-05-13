import React from 'react';
import { useMyResumes } from '../../hooks/useResumes';
import ResumeStatusBadge from './ResumeStatusBadge';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ResumeList: React.FC = () => {
  const { data, isLoading, isFetching } = useMyResumes();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded p-4" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        No resumes uploaded yet. Upload your first resume above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.resumeId} className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">{r.fileName}</div>
            <div className="text-sm text-gray-500">{formatBytes(r.fileSizeBytes)} • {formatDate(r.uploadedAt)}</div>
          </div>
          <div className="flex items-center space-x-3">
            <ResumeStatusBadge status={r.virusScanStatus} />
            <a href={`/${r.fileRef}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Open</a>
          </div>
        </div>
      ))}
      {isFetching && <div className="text-sm text-gray-400">Refreshing...</div>}
    </div>
  );
};

export default ResumeList;
