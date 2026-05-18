import React, { useMemo, useState } from 'react';
import { StudentWithEligibility } from '../../services/coordinator.service';
import { EligibilityBadge } from '../shared/EligibilityBadge';
import { EligibilityToggleButton } from './EligibilityToggleButton';

interface StudentEligibilityTableProps {
  students: StudentWithEligibility[];
  isLoading: boolean;
  onToggleSuccess?: () => void;
  onToggleError?: (error: string) => void;
}

export const StudentEligibilityTable: React.FC<StudentEligibilityTableProps> = ({
  students,
  isLoading,
  onToggleSuccess,
  onToggleError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ELIGIBLE'>('ALL');

  const filteredStudents = useMemo(() => {
    let result = students;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((student) => student.eligibilityStatus === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
          student.studentCode.toLowerCase().includes(query)
      );
    }

    return result;
  }, [students, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 text-lg">No students found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name or student code..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'PENDING'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('ELIGIBLE')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'ELIGIBLE'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Eligible
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No students match your search</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">First Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.studentCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{(typeof student.gpa === 'number' ? student.gpa : parseFloat(student.gpa)).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.academicYear}</td>
                  <td className="px-6 py-4 text-sm">
                    <EligibilityBadge status={student.eligibilityStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <EligibilityToggleButton
                      student={student}
                      onSuccess={onToggleSuccess}
                      onError={onToggleError}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
