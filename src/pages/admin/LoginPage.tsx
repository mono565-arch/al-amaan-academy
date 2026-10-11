import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { authErrorText } from '../../lib/utils';
import { Alert, ConfigMissing, Spinner } from '../../components/common';

export default function LoginPage() {
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate(from, { replace: true });
  }, [user, isAdmin, loading, navigate, from]);

  if (!isFirebaseConfigured || !auth) return <ConfigMissing />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (err) {
      setError(authErrorText(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-white">Al Amaan Academy</p>
          <p className="text-sm text-slate-300">Administrator sign in</p>
        </div>
        <div className="card">
          {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
          {user && !isAdmin && !loading && (
            <div className="mb-4 space-y-3">
              <Alert tone="warning">You are signed in, but this account is not an authorized administrator.</Alert>
              <button type="button" className="btn-secondary w-full" onClick={() => logout()}>Sign out</button>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy && <Spinner className="h-4 w-4" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">Accounts are created by the site owner. There is no public registration.</p>
        </div>
      </div>
    </div>
  );
}
