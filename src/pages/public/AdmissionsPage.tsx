import { useState, type FormEvent } from 'react';
import { Alert, PageTitle } from '../../components/common';
import { DynamicForm } from '../../components/forms/DynamicForm';
import { submitAdmission } from '../../services/submissions';
import { ADMISSION_FIELDS, initialValues, toPayload, validateValues, type FormValues } from '../../validation/forms';
import { cooldownRemaining, markSubmitted } from '../../lib/rateLimit';
import { errorMessage } from '../../lib/utils';
import { Spinner } from '../../components/common';

const COOLDOWN_KEY = 'aaa:last-admission-submit';

export default function AdmissionsPage() {
  const [values, setValues] = useState<FormValues>(() => initialValues(ADMISSION_FIELDS));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: hidden from people, often filled by bots

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'saving') return;
    if (website) {
      setStatus('success');
      setMessage('Thank you. Your application has been received.');
      return;
    }
    const found = validateValues(ADMISSION_FIELDS, values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('error');
      setMessage('Please correct the highlighted fields and try again.');
      return;
    }
    const wait = cooldownRemaining(COOLDOWN_KEY);
    if (wait > 0) {
      setStatus('error');
      setMessage(`Please wait ${Math.ceil(wait / 1000)} seconds before submitting another application.`);
      return;
    }
    setStatus('saving');
    try {
      await submitAdmission(toPayload(ADMISSION_FIELDS, values));
      markSubmitted(COOLDOWN_KEY);
      setValues(initialValues(ADMISSION_FIELDS));
      setErrors({});
      setStatus('success');
      setMessage('Thank you. Your application has been submitted. Our admissions office will contact the parent or guardian.');
    } catch (err) {
      setStatus('error');
      setMessage(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageTitle title="Admissions" text="Complete the form below to apply. Fields marked with * are required." />

      {status === 'success' && <div className="mb-6"><Alert tone="success">{message}</Alert></div>}
      {status === 'error' && <div className="mb-6"><Alert tone="error">{message}</Alert></div>}

      <form onSubmit={handleSubmit} noValidate className="card space-y-6">
        <div className="sr-only" aria-hidden="true">
          <label>
            Leave this field empty
            <input tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <h2 className="text-lg font-semibold text-navy">Student and guardian details</h2>
        <DynamicForm
          fields={ADMISSION_FIELDS}
          values={values}
          errors={errors}
          disabled={status === 'saving'}
          onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
        />

        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
          <button type="submit" className="btn-primary" disabled={status === 'saving'}>
            {status === 'saving' && <Spinner className="h-4 w-4" />}
            {status === 'saving' ? 'Submitting…' : 'Submit application'}
          </button>
          <p className="text-xs text-slate-500">Your information is kept private and is only visible to academy administrators.</p>
        </div>
      </form>
    </div>
  );
}
