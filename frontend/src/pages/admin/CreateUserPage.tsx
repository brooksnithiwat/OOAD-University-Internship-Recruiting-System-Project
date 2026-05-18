import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/auth';
import { useMutation } from '@tanstack/react-query';
import { adminUserService } from '@/services/adminUser.service';

export const CreateUserPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'UNIVERSITY_COORDINATOR'|'DEPARTMENT_HEAD'>('UNIVERSITY_COORDINATOR');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  const createStaff = useMutation({ mutationFn: (payload: any) => adminUserService.createStaffUser(payload) });

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user?.role !== 'SYSTEM_ADMINISTRATOR') return <Navigate to="/jobs" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // This page is intended to create staff accounts only (Coordinator or Department Head)
      await createStaff.mutateAsync({
        email,
        password: password || 'TempPass123!',
        firstName,
        lastName,
        department: department || '',
        role,
      });
    

      navigate('/admin/users');
    } catch (err) {
      console.error('Create user failed', err);
      alert('Failed to create user');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-2xl bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Create User</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded-lg border px-3 py-2">
                <option value="UNIVERSITY_COORDINATOR">University Coordinator</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              </div>
            </div>

            {(role === 'UNIVERSITY_COORDINATOR' || role === 'DEPARTMENT_HEAD') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Computer Engineering" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              <p className="text-xs text-gray-500 mt-1">If left blank for staff, backend may generate a temp password.</p>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              <button type="button" onClick={() => navigate('/admin/users')} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUserPage;
