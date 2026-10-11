import { useState, type FormEvent } from 'react';
import { Alert, PageTitle, Spinner } from '../../components/common';
import { DynamicForm } from '../../components/forms/DynamicForm';
import { submitFeedback } from '../../services/submissions';
import { FEEDBACK_FIELDS, initialValues, toPayload, validateValues, type FormValues } from '../../validation/forms';
import { cooldownRemaining, markSubmitted } from '../../lib/rateLimit';
import { errorMessage } from '../../lib/utils';

const COOLDOWN_KEY = 'aaa:last-feedback-submit';
const DEFAULTS = { kind: 'Feedback', anonymous: false };

export default function FeedbackPage() {
  const [values, setValues] = useState<FormValues>(() => initialValues(FEEDBACK_FIELDS, DEFAULTS));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'saving') return;
    if (website) {
      setStatus('success');
      setMessage('Thank you. Your submission has been received.');
      return;
    }
    const found = validateValues(FEEDBACK_FIELDS, values);
    if (!values.anonymous && !String(values.name).trim()) {
      found.name = 'Enter your name, or choose anonymous submission.';
    }
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('error');
      setMessage('Please correct the highlighted fields and try again.');
      return;
    }
    const wait = cooldownRemaining(COOLDOWN_KEY);
    if (wait > 0) {
      setStatus('error');
      setMessage(`Please wait ${Math.ceil(wait / 1000)} seconds before sending another submission.`);
      return;
    }
    setStatus('saving');
    try {
      const payload = toPayload(FEEDBACK_FIELDS, values);
      if (values.anonymous) {
        payload.name = '';
        payload.contact = '';
      }
      await submitFeedback(payload);
      markSubmitted(COOLDOWN_KEY);
      setValues(initialValues(FEEDBACK_FIELDS, DEFAULTS));
      setErrors({});
      setStatus('success');
      setMessage('Thank you. Your feedback has been received and will be reviewed by the administration.');
    } catch (err) {
      setStatus('error');
      setMessage(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageTitle title="Feedback & Complaints" text="Tell us what we are doing well or where we can improve. Submissions are private and reviewed by administrators." />

      {status === 'success' && <div className="mb-6"><Alert tone="success">{message}</Alert></div>}
      {status === 'error' && <div className="mb-6"><Alert tone="error">{message}</Alert></div>}

      <form onSubmit={handleSubmit} noValidate className="card space-y-6">
        <div className="sr-only" aria-hidden="true">
          <label>
            Leave this field empty
            <input tabIndex={-1} autoComplete="off" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        <DynamicForm
          fields={FEEDBACK_FIELDS}
          values={values}
          errors={errors}
          disabled={status === 'saving'}
          onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
        />

        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
          <button type="submit" className="btn-primary" disabled={status === 'saving'}>
            {status === 'saving' && <Spinner className="h-4 w-4" />}
            {status === 'saving' ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
