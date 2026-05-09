import { Link } from 'react-router-dom';

interface BackToAdminDashboardLinkProps {
  className?: string;
}

export const BackToAdminDashboardLink: React.FC<BackToAdminDashboardLinkProps> = ({
  className = '',
}) => {
  return (
    <Link
      to="/admin"
      className={`inline-block px-4 py-2 text-blue-600 hover:text-blue-800 underline ${className}`.trim()}
    >
      ← Back to Admin Dashboard
    </Link>
  );
};
