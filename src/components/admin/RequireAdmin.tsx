import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../lib/firebase';
import { Alert, ConfigMissing, LoadingBlock } from '../common';

/** Route guard. Checks sign-in and the /admins authorization on every protected admin route. */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  if (!isFirebaseConfigured) return <ConfigMissing />;
  if (loading) return <LoadingBlock />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4">
        <Alert tone="error">
          This account is signed in but is not authorized for the admin panel. Ask the site owner to add your user ID to the admins collection.
        </Alert>
        <button type="button" className="btn-secondary mt-4 w-full" onClick={() => logout()}>
          Sign out
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
