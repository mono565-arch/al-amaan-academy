import { Link } from 'react-router-dom';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { markNotificationsRead, updateRecord } from '../../services/content';
import { errorMessage, formatDateTime } from '../../lib/utils';
import { Alert, EmptyState, LoadingBlock, PageTitle } from '../../components/common';
import type { AppNotification } from '../../types';
import { useState } from 'react';

export default function NotificationsPage() {
  const { items, loading, error } = useLiveCollection<AppNotification>('notifications', { orderField: 'createdAt', direction: 'desc', limit: 200 });
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const unreadIds = items.filter((n) => !n.read).map((n) => n.id);

  async function markOne(id: string, read: boolean) {
    try {
      await updateRecord('notifications', id, { read });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    }
  }

  async function markAll() {
    try {
      await markNotificationsRead(unreadIds);
      setNotice({ tone: 'success', text: 'All notifications marked as read.' });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle title="Notifications" text="Generated automatically when applications or feedback arrive." />
        {unreadIds.length > 0 && (
          <button type="button" className="btn-secondary" onClick={markAll}>
            Mark all as read ({unreadIds.length})
          </button>
        )}
      </div>
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <section className="card">
        {loading ? <LoadingBlock /> : items.length === 0 ? (
          <EmptyState title="No notifications" text="You will see new applications and feedback here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
                    {!n.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold align-middle" aria-label="Unread" />}
                    {n.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">{n.message}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {n.link && <Link to={n.link} className="btn-small">Open</Link>}
                  <button type="button" className="btn-small" onClick={() => markOne(n.id, !n.read)}>
                    Mark as {n.read ? 'unread' : 'read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
