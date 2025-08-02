// @refresh reset
import { createContext } from 'react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token: string;
}

export interface SessionContextValue {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  isLoading: boolean;
}

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export { SessionProvider } from '../providers/SessionProvider';
