import { useEffect, useMemo, useState } from 'react';
import type { ApplicationStatus } from '../../services/application.service';

type StatusUpdateDropdownProps = {
  currentStatus: ApplicationStatus;
  onRequestUpdate: (nextStatus: ApplicationStatus) => void | Promise<void>;
  disabled?: boolean;
};

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ['INTERVIEW_REQUEST', 'REJECTED'],
  INTERVIEW_REQUEST: ['OFFER_SENT', 'REJECTED'],
  OFFER_SENT: ['ACCEPTED'],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const StatusUpdateDropdown: React.FC<StatusUpdateDropdownProps> = ({
  currentStatus,
  onRequestUpdate,
  disabled,
}) => {
  const validTransitions = useMemo(() => VALID_TRANSITIONS[currentStatus] ?? [], [currentStatus]);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  if (validTransitions.length === 0) {
    return <span className="text-sm font-medium text-gray-600">{currentStatus.replace(/_/g, ' ')}</span>;
  }

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value as ApplicationStatus;

    if (nextStatus === currentStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Update application status from ${currentStatus.replace(/_/g, ' ')} to ${nextStatus.replace(/_/g, ' ')}?`,
    );

    if (!confirmed) {
      setSelectedStatus(currentStatus);
      return;
    }

    setSelectedStatus(nextStatus);
    await onRequestUpdate(nextStatus);
  };

  return (
    <select
      value={selectedStatus}
      onChange={handleChange}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 sm:w-52"
      aria-label={`Update status from ${currentStatus}`}
    >
      <option value={currentStatus}>{currentStatus.replace(/_/g, ' ')}</option>
      {validTransitions.map((status) => (
        <option key={status} value={status}>
          {status.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  );
};

export default StatusUpdateDropdown;