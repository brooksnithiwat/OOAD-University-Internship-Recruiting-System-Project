import { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { SearchBox } from '../ui/SearchBox';
import { LocationBox } from '../ui/LocationBox';

export interface JobFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    location?: string;
    minGpa?: number;
    showAll?: boolean;
  }) => void;
  isAdmin?: boolean;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onFiltersChange, isAdmin = false }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [useStudentGpa, setUseStudentGpa] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const getShowAllValue = () => (isAdmin ? !showActiveOnly : undefined);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value,
      location,
      minGpa: useStudentGpa ? user?.gpa : undefined,
      showAll: getShowAllValue(),
    });
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    onFiltersChange({
      search,
      location: value,
      minGpa: useStudentGpa ? user?.gpa : undefined,
      showAll: getShowAllValue(),
    });
  };

  const handleGpaFilterChange = (checked: boolean) => {
    setUseStudentGpa(checked);
    onFiltersChange({
      search,
      location,
      minGpa: checked ? user?.gpa : undefined,
      showAll: getShowAllValue(),
    });
  };

  const handleActiveToggleChange = (checked: boolean) => {
    setShowActiveOnly(checked);
    onFiltersChange({
      search,
      location,
      minGpa: useStudentGpa ? user?.gpa : undefined,
      showAll: !checked,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <SearchBox
            id="search"
            label="Search"
            placeholder="Search by title or description..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div>
          <LocationBox
            id="location"
            label="Location"
            placeholder="Filter by location..."
            value={location}
            onChange={handleLocationChange}
          />
        </div>

        {!isAdmin && user?.role !== 'EMPLOYER' && (
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
        )}

        {isAdmin && (
          <div>
            <label className="flex items-center gap-2 mt-8 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => handleActiveToggleChange(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Status Active</span>
            </label>
            {showActiveOnly && (
              <p className="text-xs text-gray-500 mt-2">Showing only jobs with status ACTIVE</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
