import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { useUsers } from '../hooks/useUsers';

export function UsersPage() {
  const { users, loading, error, addUser } = useUsers();

  return (
    <main className="layout">
      <header className="hero">
        <h1>OOAD Fullstack Demo</h1>
        <p>React + NestJS + Prisma + PostgreSQL</p>
      </header>

      <section className="grid">
        <UserForm onSubmit={addUser} />
        <UserList users={users} loading={loading} error={error} />
      </section>
    </main>
  );
}
