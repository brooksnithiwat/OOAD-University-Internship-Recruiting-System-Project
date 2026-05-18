import React, { useState } from 'react';
import { useDeactivateUser } from '../../hooks/useAdminUsers';
import { User } from '../../services/adminUser.service';

interface DeactivateButtonProps {
  user: User;
  currentUserId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const DeactivateButton: React.FC<DeactivateButtonProps> = ({
  user,
  currentUserId,
  onSuccess,
  onError,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const deactivateMutation = useDeactivateUser();

  // Hide button for own account or already inactive users
  if (user.id === currentUserId || user.status === 'INACTIVE') {
    return null;
  }

  const handleConfirm = async () => {
    try {
      await deactivateMutation.mutateAsync({
        userId: user.id,
      });
      setShowConfirm(false);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate user';
      onError?.(message);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={deactivateMutation.isPending}
          className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deactivateMutation.isPending ? 'Deactivating...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deactivateMutation.isPending}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
    >
      Deactivate
    </button>
  );
};
