import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { deleteRecord, updateRecord } from '../../services/content';
import { FEEDBACK_STATUSES, type FeedbackItem, type FeedbackStatus } from '../../types';
import { errorMessage, formatDateTime } from '../../lib/utils';
import { Alert, EmptyState, LoadingBlock, PageTitle, Spinner } from '../../components/common';

export default function FeedbackAdminPage() {
  const { items, loading, error } = useLiveCollection<FeedbackItem>('feedback', { orderField: 'createdAt', direction: 'desc' });
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('id');
  const [kindFilter, setKindFilter] = useState<'All' | 'Feedback' | 'Complaint'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | FeedbackStatus>('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter(
        (f) =>
          (kindFilter === 'All' || f.kind === kindFilter) &&
          (statusFilter === 'All' || f.status === statusFilter) &&
          (!unreadOnly || !f.read),
      ),
    [items, kindFilter, statusFilter, unreadOnly],
  );

  const selected = items.find((f) => f.id === selectedId) ?? null;

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    try {
      await action();
      setNotice({ tone: 'success', text: success });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Feedback & complaints" text="Private. Unread items are shown in bold." />
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card space-y-4 xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <select aria-label="Filter by type" className="input" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}>
              <option value="All">All types</option>
              <option value="Feedback">Feedback</option>
              <option value="Complaint">Complaints</option>
            </select>
            <select aria-label="Filter by status" className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="All">All statuses</option>
              {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
            Show unread only
          </label>

          {loading ? <LoadingBlock /> : filtered.length === 0 ? (
            <EmptyState title="Nothing to show" text="Feedback and complaints submitted on the website appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ id: f.id })}
                    aria-current={f.id === selectedId ? 'true' : undefined}
                    className={`flex w-full items-start justify-between gap-3 rounded-md px-3 py-3 text-left transition hover:bg-slate-50 ${f.id === selectedId ? 'bg-slate-100' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className={`block truncate text-sm ${f.read ? 'text-slate-700' : 'font-bold text-slate-900'}`}>
                        {!f.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold align-middle" aria-label="Unread" />}
                        {f.subject}
                      </span>
                      <span className="block text-xs text-slate-500">{f.kind} · {f.anonymous ? 'Anonymous' : f.name || 'No name'} · {formatDateTime(f.createdAt)}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{f.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card xl:col-span-3">
          {selected ? (
            <FeedbackDetail key={selected.id} item={selected} busy={busy} onRun={run} onDeleted={() => setParams({})} />
          ) : (
            <EmptyState title="Select a submission" text="Choose an item on the left to read it. Opening an item marks it as read." />
          )}
        </section>
      </div>
    </div>
  );
}

function FeedbackDetail({
  item: f,
  busy,
  onRun,
  onDeleted,
}: {
  item: FeedbackItem;
  busy: boolean;
  onRun: (action: () => Promise<void>, success: string) => Promise<void>;
  onDeleted: () => void;
}) {
  const [status, setStatus] = useState<FeedbackStatus>(f.status);
  useEffect(() => setStatus(f.status), [f.status]);

  // Opening a submission marks it read, so new complaints stop showing as unread.
  useEffect(() => {
    if (!f.read) {
      updateRecord('feedback', f.id, { read: true }).catch(() => undefined);
    }
  }, [f.id, f.read]);

  return (
    <div className="space-y-6">
      <div>
        <p className={`text-sm font-semibold ${f.kind === 'Complaint' ? 'text-red-700' : 'text-emerald-700'}`}>{f.kind}</p>
        <h2 className="text-xl font-bold text-navy">{f.subject}</h2>
        <p className="text-sm text-slate-500">Received {formatDateTime(f.createdAt)}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</dt>
          <dd className="mt-1 text-sm text-slate-900">{f.anonymous ? 'Anonymous' : f.name || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</dt>
          <dd className="mt-1 text-sm text-slate-900">{f.contact || '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</dt>
          <dd className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-900">{f.message}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
        <div>
          <label htmlFor="fb-status" className="label">Status</label>
          <select id="fb-status" className="input w-48" value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)} disabled={busy}>
            {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={busy || status === f.status}
          onClick={() => onRun(() => updateRecord('feedback', f.id, { status }), 'Status updated.')}
        >
          Update status
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy}
          onClick={() => onRun(() => updateRecord('feedback', f.id, { read: !f.read }), f.read ? 'Marked as unread.' : 'Marked as read.')}
        >
          Mark as {f.read ? 'unread' : 'read'}
        </button>
        <button
          type="button"
          className="btn-danger ml-auto"
          disabled={busy}
          onClick={() => {
            if (!window.confirm('Delete this submission permanently?')) return;
            onRun(async () => {
              await deleteRecord('feedback', f.id);
              onDeleted();
            }, 'Submission deleted.');
          }}
        >
          Delete
        </button>
        {busy && <Spinner className="h-4 w-4 text-navy" />}
      </div>
    </div>
  );
}
