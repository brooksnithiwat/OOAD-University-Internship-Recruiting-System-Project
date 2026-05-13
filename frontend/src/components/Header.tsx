import { useAuth } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark-blue text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold font-castoro sm:text-2xl">Internship System</h2>
          {user && <p className="text-sm text-gray-300">{user.role}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {user && (
            <span className="max-w-full break-all text-xs text-gray-100 sm:text-sm">{user.email}</span>
          )}

          <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
          {user?.role === 'STUDENT' && (
            <button
              onClick={() => navigate('/profile/resumes')}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:flex-none"
            >
              Resumes
            </button>
          )}
          {user?.role === 'SYSTEM_ADMINISTRATOR' && (
            <button
              onClick={() => navigate('/admin')}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:flex-none"
            >
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:flex-none"
          >
            Logout
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};
