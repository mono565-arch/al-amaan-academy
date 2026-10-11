import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

interface AuthValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  isAdmin: false,
  loading: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth || !db) return;
    const database = db;
    return onAuthStateChanged(auth, async (current) => {
      setLoading(true);
      setUser(current);
      if (!current) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        // Authorization is a document in /admins/{uid}. Signing in alone is never enough.
        const snap = await getDoc(doc(database, 'admins', current.uid));
        setIsAdmin(snap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAdmin,
      loading,
      logout: async () => {
        if (auth) await signOut(auth);
      },
    }),
    [user, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
