// AuthCallback.tsx
// Handles the OAuth redirect from backend, stores session token, updates auth state, and redirects.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../SessionContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useSession();

  useEffect(() => {
    // Try to get token from query param or fragment
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');
    // If not in query, try fragment
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      token = hashParams.get('token');
    }
    if (!token) {
      // Could also check for cookie-based session here
      // Show error or redirect to login
      navigate('/login?error=missing_token', { replace: true });
      return;
    }
    // Fetch user info from backend using token
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch user info');
        }
        return res.json();
      })
      .then((user) => {
        setUser({ ...user, token });
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=invalid_token', { replace: true });
      });
  }, [setUser, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-lg text-gray-700">Signing you in...</div>
    </div>
  );
}
