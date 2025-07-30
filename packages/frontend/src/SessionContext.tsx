import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token: string;
}

interface SessionContextValue {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

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

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
