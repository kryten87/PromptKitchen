// packages/frontend/src/providers/SessionProvider.tsx
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { SessionContext } from '../contexts/SessionContextValue';
import type { UserSession } from '../types';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load session from localStorage
    const raw = localStorage.getItem('userSession');
    if (raw) {
      setUser(JSON.parse(raw));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('userSession', JSON.stringify(user));
      localStorage.setItem('sessionToken', user.token);
    } else {
      localStorage.removeItem('userSession');
      localStorage.removeItem('sessionToken');
    }
  }, [user]);

  return (
    <SessionContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}
