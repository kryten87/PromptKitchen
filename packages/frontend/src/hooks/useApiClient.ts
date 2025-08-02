import { useContext, useMemo } from 'react';
import { ApiClient } from '../ApiClient';
import { SessionContext } from '../contexts/SessionContext';

export function useApiClient() {
  const session = useContext(SessionContext);
  const client = useMemo(() => new ApiClient(session), [session]);
  return client;
}
