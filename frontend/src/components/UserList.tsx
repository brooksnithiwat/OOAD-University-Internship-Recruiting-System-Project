import { type User } from '../services/userService';

type UserListProps = {
  users: User[];
  loading: boolean;
  error: string | null;
};

export function UserList({ users, loading, error }: UserListProps) {
  if (loading) {
    return <section className="card"><p>Loading users...</p></section>;
  }

  if (error) {
    return <section className="card"><p className="error">{error}</p></section>;
  }

  return (
    <section className="card">
      <h2>Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>
              <div>
                <strong>{user.name ?? 'Unnamed user'}</strong>
                <p>{user.email}</p>
              </div>
              <small>{new Date(user.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
