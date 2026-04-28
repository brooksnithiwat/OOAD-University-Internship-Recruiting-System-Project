import { useState } from 'react';
import { useAuth } from '../../contexts/auth';

export interface JobFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    location?: string;
    minGpa?: number;
  }) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onFiltersChange }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [useStudentGpa, setUseStudentGpa] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ search: value, location, minGpa: useStudentGpa ? user?.gpa : undefined });
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    onFiltersChange({ search, location: value, minGpa: useStudentGpa ? user?.gpa : undefined });
  };

  const handleGpaFilterChange = (checked: boolean) => {
    setUseStudentGpa(checked);
    onFiltersChange({
      search,
      location,
      minGpa: checked ? user?.gpa : undefined,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 mt-8 cursor-pointer">
            <input
              type="checkbox"
              checked={useStudentGpa}
              onChange={(e) => handleGpaFilterChange(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              My GPA ({user?.gpa?.toFixed(2) || 'N/A'})
            </span>
          </label>
          {useStudentGpa && (
            <p className="text-xs text-gray-500 mt-2">
              Showing jobs where min GPA ≤ {user?.gpa?.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
