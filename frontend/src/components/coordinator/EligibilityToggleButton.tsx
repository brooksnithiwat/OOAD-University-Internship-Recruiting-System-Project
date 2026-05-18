import React from 'react';
import { useUpdateEligibility } from '../../hooks/useCoordinator';
import { StudentWithEligibility } from '../../services/coordinator.service';

interface EligibilityToggleButtonProps {
  student: StudentWithEligibility;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EligibilityToggleButton: React.FC<EligibilityToggleButtonProps> = ({
  student,
  onSuccess,
  onError,
}) => {
  const updateMutation = useUpdateEligibility();

  const newStatus = student.eligibilityStatus === 'ELIGIBLE' ? 'PENDING' : 'ELIGIBLE';
  const buttonLabel = student.eligibilityStatus === 'PENDING' ? 'Set Eligible' : 'Set Pending';
  const buttonColor =
    student.eligibilityStatus === 'PENDING'
      ? 'bg-green-500 hover:bg-green-600'
      : 'bg-yellow-500 hover:bg-yellow-600';

  const handleToggle = async () => {
    try {
      await updateMutation.mutateAsync({
        studentId: student.studentId,
        payload: { status: newStatus },
      });
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update eligibility';
      onError?.(message);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={updateMutation.isPending}
      className={`px-3 py-1 text-sm font-medium text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
    >
      {updateMutation.isPending ? 'Updating...' : buttonLabel}
    </button>
  );
};
