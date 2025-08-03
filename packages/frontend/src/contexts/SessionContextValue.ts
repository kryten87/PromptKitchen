import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';
import type { UserSession } from '../types';

export interface SessionContextValue {
  user: UserSession | null;
  setUser: Dispatch<SetStateAction<UserSession | null>>;
  isLoading: boolean;
}

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);
