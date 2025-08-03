/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from './hooks/useSession';
import { SessionProvider } from './providers/SessionProvider';

function TestComponent() {
  const { user, setUser, isLoading } = useSession();
  return (
    <div>
      <div>isLoading: {isLoading ? 'yes' : 'no'}</div>
      <div>user: {user ? user.email : 'none'}</div>
      <button onClick={() => setUser({ id: '1', email: 'a@b.com', name: 'A', token: 't' })}>Set</button>
      <button onClick={() => setUser(null)}>Clear</button>
    </div>
  );
}

describe('SessionContext', () => {
  it('provides user session and persists to localStorage', async () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );
    expect(screen.getByText(/isLoading/)).toBeInTheDocument();
    expect(screen.getByText(/user: none/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Set'));
    expect(screen.getByText(/user: a@b.com/)).toBeInTheDocument();
    expect(localStorage.getItem('userSession')).toContain('a@b.com');
    await userEvent.click(screen.getByText('Clear'));
    expect(screen.getByText(/user: none/)).toBeInTheDocument();
  });
});
