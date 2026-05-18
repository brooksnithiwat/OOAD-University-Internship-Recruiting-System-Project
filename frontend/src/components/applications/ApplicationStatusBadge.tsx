import type { ApplicationStatus } from '../../services/application.service';

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
  INTERVIEW_REQUEST: 'bg-blue-100 text-blue-800 border-blue-200',
  OFFER_SENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  WITHDRAWN: 'bg-gray-100 text-gray-500 border-gray-200 opacity-75',
};

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[status]} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default ApplicationStatusBadge;