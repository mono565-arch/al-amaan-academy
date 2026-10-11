import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useLiveCollection } from '../../hooks/useLiveCollection';
import { createRecord, deleteRecord, reorderRecords, updateRecord } from '../../services/content';
import { DynamicForm } from '../forms/DynamicForm';
import { initialValues, toPayload, validateValues, type FieldDef, type FormValues } from '../../validation/forms';
import { errorMessage } from '../../lib/utils';
import { Alert, EmptyState, LoadingBlock, Spinner } from '../common';
import type { ManagedItem } from '../../types';

interface Props<T extends ManagedItem> {
  collectionName: string;
  noun: string;
  fields: FieldDef[];
  defaults?: Record<string, unknown>;
  label: (item: T) => string;
  renderCard: (item: T) => ReactNode;
}

/** Generic admin editor: real Firestore create, read, update, delete, publish, search and reorder. */
export function CollectionManager<T extends ManagedItem>({ collectionName, noun, fields, defaults, label, renderCard }: Props<T>) {
  const { items, loading, error } = useLiveCollection<T>(collectionName, { orderField: 'order', direction: 'asc' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  const visible = useMemo(
    () => items.filter((i) => !search || label(i).toLowerCase().includes(search.trim().toLowerCase())),
    [items, search, label],
  );

  function openNew() {
    setEditingId(null);
    setValues(initialValues(fields, defaults));
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(item: T) {
    setEditingId(item.id);
    setValues(initialValues(fields, item as unknown as Record<string, unknown>));
    setErrors({});
    setFormOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const found = validateValues(fields, values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const payload = toPayload(fields, values);
      if (editingId) {
        await updateRecord(collectionName, editingId, payload);
      } else {
        const nextOrder = items.reduce((max, i) => Math.max(max, i.order ?? 0), 0) + 1;
        await createRecord(collectionName, { ...payload, order: nextOrder });
      }
      setFormOpen(false);
      setNotice({ tone: 'success', text: `${noun.charAt(0).toUpperCase() + noun.slice(1)} saved.` });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: T) {
    setBusyId(item.id);
    try {
      await updateRecord(collectionName, item.id, { published: !item.published });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((i) => i.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(items[index].id);
    try {
      await reorderRecords(collectionName, ids);
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: T) {
    if (!window.confirm(`Delete this ${noun}? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      await deleteRecord(collectionName, item.id);
      setNotice({ tone: 'success', text: `${noun.charAt(0).toUpperCase() + noun.slice(1)} deleted.` });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <label htmlFor={`search-${collectionName}`} className="sr-only">Search</label>
          <input
            id={`search-${collectionName}`}
            type="search"
            className="input"
            placeholder={`Search ${noun}s…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="btn-primary" onClick={openNew}>
          Add {noun}
        </button>
      </div>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      {formOpen && (
        <form onSubmit={handleSave} noValidate className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-4 font-semibold text-navy">{editingId ? `Edit ${noun}` : `Add ${noun}`}</h3>
          <DynamicForm fields={fields} values={values} errors={errors} disabled={saving} onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))} />
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingBlock />
      ) : visible.length === 0 ? (
        <EmptyState title={search ? 'No matches found' : `No ${noun}s yet`} text={search ? 'Try a different search.' : `Use "Add ${noun}" to create the first one.`} />
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {visible.map((item) => {
            const index = items.findIndex((i) => i.id === item.id);
            const busy = busyId === item.id;
            return (
              <li key={item.id} className={`rounded-xl border p-4 ${item.published ? 'border-slate-200 bg-white' : 'border-dashed border-slate-300 bg-slate-50'}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {item.published ? 'Published' : 'Hidden'}
                  </span>
                  <span className="text-xs text-slate-500">Display order {item.order}</span>
                </div>
                {renderCard(item)}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <button type="button" className="btn-small" onClick={() => openEdit(item)} disabled={busy}>Edit</button>
                  <button type="button" className="btn-small" onClick={() => togglePublished(item)} disabled={busy}>
                    {item.published ? 'Hide' : 'Publish'}
                  </button>
                  <button type="button" className="btn-small" onClick={() => move(index, -1)} disabled={busy || !!search || index <= 0} aria-label="Move up">↑ Up</button>
                  <button type="button" className="btn-small" onClick={() => move(index, 1)} disabled={busy || !!search || index >= items.length - 1} aria-label="Move down">↓ Down</button>
                  <button type="button" className="btn-small border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleDelete(item)} disabled={busy}>Delete</button>
                  {busy && <Spinner className="ml-1 h-4 w-4 text-navy" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
