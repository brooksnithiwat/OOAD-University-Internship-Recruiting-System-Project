import { useAuth } from './contexts/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { JobBoardPage } from '@/pages/JobBoardPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { CreateJobPage } from '@/pages/CreateJobPage';
import { EditJobPostPage } from '@/pages/EditJobPostPage';
import ResumePage from './pages/ResumePage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { UnverifiedEmployersPage } from '@/pages/admin/UnverifiedEmployersPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { CreateUserPage } from '@/pages/admin/CreateUserPage';
import { CoordinatorDashboardPage } from '@/pages/coordinator/CoordinatorDashboardPage';
import { CoordinatorStudentListPage } from '@/pages/coordinator/CoordinatorStudentListPage';
import { DepartmentDashboardPage } from './pages/department/DepartmentDashboardPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ApplicantListPage } from './pages/ApplicantListPage';

const HomePage = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-dark-blue mb-4 font-castoro">Welcome</h1>
        <p className="text-gray-600 mb-6">You are successfully authenticated.</p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App = () => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'SYSTEM_ADMINISTRATOR' ? (
              <Navigate to="/admin" replace />
            ) : user?.role === 'UNIVERSITY_COORDINATOR' ? (
              <Navigate to="/coordinator" replace />
            ) : user?.role === 'DEPARTMENT_HEAD' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/jobs" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/jobs"
        element={
          <PrivateRoute>
            <JobBoardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/create"
        element={
          <PrivateRoute>
            <CreateJobPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/:id/edit"
        element={
          <PrivateRoute>
            <EditJobPostPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <PrivateRoute>
            <JobDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/resumes"
        element={
          <PrivateRoute>
            <ResumePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/applications/my"
        element={
          <PrivateRoute>
            <MyApplicationsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/job-posts/:id/applications"
        element={
          <PrivateRoute>
            <ApplicantListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DepartmentDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/employers/unverified"
        element={
          <PrivateRoute>
            <UnverifiedEmployersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <PrivateRoute>
            <CreateUserPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/coordinator"
        element={
          <PrivateRoute>
            <CoordinatorDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/coordinator/students"
        element={
          <PrivateRoute>
            <CoordinatorStudentListPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
