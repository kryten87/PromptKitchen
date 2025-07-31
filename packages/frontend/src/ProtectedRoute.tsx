// ProtectedRoute.tsx
// A wrapper for react-router-dom Route that redirects to /login if not authenticated
import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './SessionContext';

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useSession();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
