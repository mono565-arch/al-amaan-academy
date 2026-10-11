import { useState, type FormEvent } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { authErrorText } from '../../lib/utils';
import { Alert, PageTitle, Spinner } from '../../components/common';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!auth || !user || !user.email) return;
    if (!current) return setNotice({ tone: 'error', text: 'Enter your current password.' });
    if (next.length < 8) return setNotice({ tone: 'error', text: 'The new password must be at least 8 characters.' });
    if (next !== confirm) return setNotice({ tone: 'error', text: 'The new passwords do not match.' });
    if (next === current) return setNotice({ tone: 'error', text: 'The new password must be different from the current password.' });

    setBusy(true);
    setNotice(null);
    try {
      // Firebase requires a recent sign-in before a password change, so re-verify the current password first.
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
      await updatePassword(user, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setNotice({ tone: 'success', text: 'Your password has been updated.' });
    } catch (err) {
      setNotice({ tone: 'error', text: authErrorText(err) });
    } finally {
      setBusy(false);
    }
  }

  const inputType = show ? 'text' : 'password';

  return (
    <div className="max-w-lg">
      <PageTitle title="Change password" text="Enter your current password, then choose a new one of at least 8 characters." />
      {notice && <div className="mb-4"><Alert tone={notice.tone}>{notice.text}</Alert></div>}
      <form onSubmit={handleSubmit} noValidate className="card space-y-4">
        <div>
          <label htmlFor="current" className="label">Current password</label>
          <input id="current" type={inputType} autoComplete="current-password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label htmlFor="next" className="label">New password</label>
          <input id="next" type={inputType} autoComplete="new-password" className="input" value={next} onChange={(e) => setNext(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm new password</label>
          <input id="confirm" type={inputType} autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={busy} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy" checked={show} onChange={(e) => setShow(e.target.checked)} />
          Show passwords
        </label>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy && <Spinner className="h-4 w-4" />}
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
