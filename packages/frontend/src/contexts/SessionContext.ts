// packages/frontend/src/contexts/SessionContext.ts
import { createContext } from 'react';
import type { UserSession } from '../types';

interface SessionContextValue {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isLoading: boolean;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);
