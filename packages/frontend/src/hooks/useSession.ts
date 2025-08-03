import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionContextValue';

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
