import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../SessionContext';
import { AuthCallback } from './AuthCallback';

// Use jest.mock to mock useNavigate and expose a mock function for assertions
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthCallback', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    globalThis.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  it('redirects to login if no token is present', async () => {
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={[{ pathname: '/auth/callback' }] }>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=missing_token', { replace: true });
    });
  });

  it('fetches user info and sets session if token is present', async () => {
    // Set up fetch mock before rendering
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', email: 'a@b.com', name: 'Test User', avatarUrl: '' }),
    } as Response);
    // Debug: check window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        search: '?token=abc123',
        hash: '',
        pathname: '/auth/callback',
      },
      writable: true,
    });
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={[{ pathname: '/auth/callback', search: '?token=abc123' }] }>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      // Wait for userSession to be set in localStorage
      const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
      expect(userSession.token).toBe('abc123');
      expect(localStorage.getItem('sessionToken')).toBe('abc123');
    });
  });
});
