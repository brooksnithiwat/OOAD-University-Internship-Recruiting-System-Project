import { FormEvent, useState } from 'react';

type UserFormProps = {
  onSubmit: (values: { email: string; name?: string }) => Promise<unknown>;
};

export function UserForm({ onSubmit }: UserFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      await onSubmit({
        email,
        name: name.trim() || undefined,
      });
      setEmail('');
      setName('');
    } catch {
      setError('Failed to create user. Check if email is unique.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Create User</h2>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="jane@example.com"
        />
      </label>

      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane"
        />
      </label>

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
