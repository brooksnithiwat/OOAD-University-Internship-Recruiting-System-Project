import React from 'react';
import { UserRole } from '../services/adminUser.service';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleConfig: Record<UserRole, { bg: string; text: string; label: string }> = {
  STUDENT: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Student',
  },
  EMPLOYER: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'Employer',
  },
  UNIVERSITY_COORDINATOR: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    label: 'Coordinator',
  },
  DEPARTMENT_HEAD: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'Department Head',
  },
  SYSTEM_ADMINISTRATOR: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Administrator',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
};
