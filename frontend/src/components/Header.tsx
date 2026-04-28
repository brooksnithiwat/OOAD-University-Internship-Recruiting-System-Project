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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-castoro">Internship System</h2>
          {user && <p className="text-sm text-gray-300">{user.role}</p>}
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
