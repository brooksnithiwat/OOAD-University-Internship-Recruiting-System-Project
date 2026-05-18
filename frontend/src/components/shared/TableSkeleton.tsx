import React from 'react';

interface SkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<SkeletonProps> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md flex-1 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
