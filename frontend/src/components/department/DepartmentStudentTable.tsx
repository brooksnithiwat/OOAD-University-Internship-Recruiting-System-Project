import React, { useMemo, useState } from 'react';
import { StudentWithEligibility } from '../../services/coordinator.service';
import { EligibilityBadge } from '../shared/EligibilityBadge';

interface DepartmentStudentTableProps {
  students: StudentWithEligibility[];
  isLoading: boolean;
}

export const DepartmentStudentTable: React.FC<DepartmentStudentTableProps> = ({
  students,
  isLoading,
  onApproveSuccess,
  onApproveError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(query) ||
        student.studentCode.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

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
        <p className="text-gray-500 text-lg">No students in your department</p>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Faculty</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">GPA</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.studentCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.faculty}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.academicYear}</td>
                  <td className="px-6 py-4 text-sm">
                    <EligibilityBadge status={student.eligibilityStatus} />
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
