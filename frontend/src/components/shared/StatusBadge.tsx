import React from 'react';
import { UserStatus } from '../../services/adminUser.service';

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const isActive = status === 'ACTIVE';
  const bgColor = isActive ? 'bg-green-100' : 'bg-gray-100';
  const textColor = isActive ? 'text-green-800' : 'text-gray-800';
  const label = isActive ? 'Active' : 'Inactive';

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} ${className}`}>
      {label}
    </span>
  );
};
