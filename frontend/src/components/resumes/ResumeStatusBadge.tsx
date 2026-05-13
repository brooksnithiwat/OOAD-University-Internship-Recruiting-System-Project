import React from 'react';

type Props = {
  status: 'PENDING' | 'CLEAN' | 'INFECTED';
};

const ResumeStatusBadge: React.FC<Props> = ({ status }) => {
  if (status === 'PENDING') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-yellow-100 text-yellow-800">Scanning...</span>;
  }
  if (status === 'CLEAN') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">Ready</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-red-100 text-red-800">Infected</span>;
};

export default ResumeStatusBadge;
