import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { useAuth } from '@/hooks/useAuth';

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark-blue mb-4 font-castoro">Welcome</h1>
        <p className="text-gray-600 mb-6">You are successfully authenticated.</p>
        <button
          onClick={logout}
          className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
