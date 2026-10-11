import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { deleteRecord, updateRecord } from '../../services/content';
import { ADMISSION_STATUSES, type Admission, type AdmissionStatus } from '../../types';
import { errorMessage, formatDateTime } from '../../lib/utils';
import { Alert, EmptyState, LoadingBlock, PageTitle, Spinner } from '../../components/common';

export default function AdmissionsAdminPage() {
  const { items, loading, error } = useLiveCollection<Admission>('admissions', { orderField: 'createdAt', direction: 'desc' });
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('id');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AdmissionStatus>('All');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (a) =>
        (statusFilter === 'All' || a.status === statusFilter) &&
        (!q || [a.studentName, a.guardianName, a.guardianPhone, a.gradeApplied, a.email].join(' ').toLowerCase().includes(q)),
    );
  }, [items, query, statusFilter]);

  const selected = items.find((a) => a.id === selectedId) ?? null;

  async function changeStatus(id: string, status: AdmissionStatus) {
    setBusy(true);
    try {
      await updateRecord('admissions', id, { status });
      setNotice({ tone: 'success', text: `Status updated to “${status}”.` });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this application permanently?')) return;
    setBusy(true);
    try {
      await deleteRecord('admissions', id);
      setParams({});
      setNotice({ tone: 'success', text: 'Application deleted.' });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Admission applications" text="Private. Only administrators can see these records." />
      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card space-y-4 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input type="search" aria-label="Search applications" className="input" placeholder="Search name, guardian, phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select aria-label="Filter by status" className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | AdmissionStatus)}>
              <option value="All">All statuses</option>
              {ADMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? <LoadingBlock /> : filtered.length === 0 ? (
            <EmptyState title="No applications found" text="Submissions from the Admissions page appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ id: a.id })}
                    aria-current={a.id === selectedId ? 'true' : undefined}
                    className={`flex w-full items-start justify-between gap-3 rounded-md px-3 py-3 text-left transition hover:bg-slate-50 ${a.id === selectedId ? 'bg-slate-100' : ''}`}
                  >
                    <span>
                      <span className="block font-semibold text-slate-900">{a.studentName}</span>
                      <span className="block text-xs text-slate-500">{a.gradeApplied} · {formatDateTime(a.createdAt)}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{a.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card xl:col-span-3">
          {selected ? (
            <AdmissionDetail
              key={selected.id}
              application={selected}
              busy={busy}
              onStatus={(s) => changeStatus(selected.id, s)}
              onDelete={() => remove(selected.id)}
            />
          ) : (
            <EmptyState title="Select an application" text="Choose an application on the left to view its full details." />
          )}
        </section>
      </div>
    </div>
  );
}

function AdmissionDetail({
  application: a,
  busy,
  onStatus,
  onDelete,
}: {
  application: Admission;
  busy: boolean;
  onStatus: (s: AdmissionStatus) => void;
  onDelete: () => void;
}) {
  const [status, setStatus] = useState<AdmissionStatus>(a.status);
  useEffect(() => setStatus(a.status), [a.status]);

  const rows: Array<[string, string]> = [
    ['Student name', a.studentName],
    ['Date of birth', a.dateOfBirth],
    ['Gender', a.gender || '—'],
    ['Guardian name', a.guardianName],
    ['Guardian phone', a.guardianPhone],
    ['Email', a.email || '—'],
    ['Applying for', a.gradeApplied],
    ['Previous school', a.previousSchool || '—'],
    ['Address', a.address],
    ['Notes', a.notes || '—'],
    ['Submitted', formatDateTime(a.createdAt)],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">{a.studentName}</h2>
        <p className="text-sm text-slate-500">Application ID: {a.id}</p>
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className={label === 'Address' || label === 'Notes' ? 'sm:col-span-2' : ''}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input w-56" value={status} onChange={(e) => setStatus(e.target.value as AdmissionStatus)} disabled={busy}>
            {ADMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => onStatus(status)} disabled={busy || status === a.status}>
          {busy && <Spinner className="h-4 w-4" />}
          Update status
        </button>
        <button type="button" className="btn-danger ml-auto" onClick={onDelete} disabled={busy}>Delete application</button>
      </div>
    </div>
  );
}
