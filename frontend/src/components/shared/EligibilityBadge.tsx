import React from 'react';

interface EligibilityBadgeProps {
  status: 'ELIGIBLE' | 'PENDING';
  className?: string;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ status, className = '' }) => {
  const isEligible = status === 'ELIGIBLE';
  const bgColor = isEligible ? 'bg-green-100' : 'bg-yellow-100';
  const textColor = isEligible ? 'text-green-800' : 'text-yellow-800';
  const label = isEligible ? 'Eligible' : 'Pending';

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} ${className}`}>
      {label}
    </span>
  );
};
