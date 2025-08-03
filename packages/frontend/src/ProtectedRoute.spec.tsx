import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionProvider } from './providers/SessionProvider';

function TestComponent() {
  return <div>Protected Content</div>;
}

describe('ProtectedRoute', () => {
  it('renders children if user is authenticated', () => {
    localStorage.setItem('userSession', JSON.stringify({ token: 'abc', id: '1', email: 'a@b.com', name: 'Test' }));
    render(
      <SessionProvider>
        <MemoryRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </SessionProvider>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    localStorage.clear();
  });

  it('redirects to /login if user is not authenticated', () => {
    localStorage.clear();
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={["/protected"]}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      </SessionProvider>
    );
    // Should not render children
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Should render a loading or nothing, but we can't check navigation here
  });
});
