import { useEffect, useState, type FormEvent } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { saveSettings } from '../../services/content';
import { DynamicForm } from '../../components/forms/DynamicForm';
import { SETTINGS_FIELDS, initialValues, toPayload, validateValues, type FormValues } from '../../validation/forms';
import { errorMessage } from '../../lib/utils';
import { Alert, LoadingBlock, PageTitle, Spinner } from '../../components/common';

export default function SettingsPage() {
  const { settings, loading, error: loadError } = useSiteSettings();
  const [values, setValues] = useState<FormValues>({});
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  // Populate the form once, from the live settings, so later snapshots don't overwrite unsaved edits.
  useEffect(() => {
    if (!loading && !loaded) {
      setValues(initialValues(SETTINGS_FIELDS, settings as unknown as Record<string, unknown>));
      setLoaded(true);
    }
  }, [loading, loaded, settings]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const found = validateValues(SETTINGS_FIELDS, values);
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      await saveSettings(toPayload(SETTINGS_FIELDS, values));
      setNotice({ tone: 'success', text: 'Settings saved. The public website updates automatically.' });
    } catch (err) {
      setNotice({ tone: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="max-w-4xl">
      <PageTitle title="Website settings" text="Branding, content and contact details shown across the public website." />
      {loadError && <div className="mb-4"><Alert tone="error">{loadError}</Alert></div>}
      {notice && <div className="mb-4"><Alert tone={notice.tone}>{notice.text}</Alert></div>}
      <form onSubmit={handleSave} noValidate className="card space-y-6">
        <DynamicForm fields={SETTINGS_FIELDS} values={values} errors={errors} disabled={saving} onChange={(k, v) => setValues((p) => ({ ...p, [k]: v }))} />
        <div className="border-t border-slate-100 pt-5">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <Spinner className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
