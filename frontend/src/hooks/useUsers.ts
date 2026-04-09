import { useCallback, useEffect, useState } from 'react';
import { createUser, getUsers, type CreateUserPayload, type User } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addUser = useCallback(async (payload: CreateUserPayload) => {
    const created = await createUser(payload);
    setUsers((current) => [created, ...current]);
    return created;
  }, []);

  return {
    users,
    loading,
    error,
    refresh,
    addUser,
  };
}
