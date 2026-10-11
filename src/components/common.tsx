import { useState, type ReactNode } from 'react';
import { cn, isValidHttpUrl } from '../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
    />
  );
}

export function LoadingBlock() {
  return (
    <div className="flex justify-center py-10 text-navy">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'success' | 'error' | 'warning'; children: ReactNode }) {
  const styles = {
    info: 'bg-sky-50 text-sky-900 ring-sky-200',
    success: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
    error: 'bg-red-50 text-red-900 ring-red-200',
    warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-lg p-4 text-sm ring-1', styles[tone])}>
      {children}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function SectionHeading({ id, eyebrow, title, text }: { id?: string; eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">{eyebrow}</p>}
      <h2 id={id} className="mt-1 text-3xl font-bold text-navy">{title}</h2>
      {text && <p className="mt-3 text-slate-600">{text}</p>}
    </div>
  );
}

export function PageTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
    </div>
  );
}

export function ConfigMissing() {
  return (
    <div className="mx-auto mt-16 max-w-xl px-4">
      <div className="card">
        <h1 className="text-xl font-bold text-navy">Firebase is not configured</h1>
        <p className="mt-3 text-sm text-slate-600">
          Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to <code className="rounded bg-slate-100 px-1">.env.local</code>,
          add the values from your own Firebase project, then restart the development server. The README explains each step.
        </p>
      </div>
    </div>
  );
}

export function Logo({ url, name, className }: { url: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (isValidHttpUrl(url) && !failed) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        onError={() => setFailed(true)}
        className={cn('h-11 w-11 rounded-full bg-white object-contain', className)}
      />
    );
  }
  return (
    <span aria-hidden="true" className={cn('flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold', className)}>
      AA
    </span>
  );
}

