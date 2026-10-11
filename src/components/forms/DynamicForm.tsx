import type { FieldDef, FieldKind, FormValues } from '../../validation/forms';

interface Props {
  fields: FieldDef[];
  values: FormValues;
  errors: Record<string, string>;
  onChange: (key: string, value: string | boolean) => void;
  disabled?: boolean;
}

const INPUT_TYPE: Partial<Record<FieldKind, string>> = {
  text: 'text',
  url: 'url',
  email: 'email',
  phone: 'tel',
  date: 'date',
  datetime: 'datetime-local',
  year: 'text',
};

/** Renders a form from a field list. Used by every admin editor and by the public forms. */
export function DynamicForm({ fields, values, errors, onChange, disabled }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `field-${f.key}`;
        const error = errors[f.key];
        const wide = f.kind === 'textarea' || f.kind === 'url' || f.kind === 'checkbox' ? 'sm:col-span-2' : '';

        if (f.kind === 'checkbox') {
          return (
            <label key={f.key} className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <input
                id={id}
                name={f.key}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
                checked={values[f.key] === true}
                onChange={(e) => onChange(f.key, e.target.checked)}
                disabled={disabled}
              />
              {f.label}
            </label>
          );
        }

        const value = String(values[f.key] ?? '');
        const shared = {
          id,
          name: f.key,
          disabled,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${id}-error` : f.hint ? `${id}-hint` : undefined,
        };

        return (
          <div key={f.key} className={wide}>
            <label htmlFor={id} className="label">
              {f.label}
              {f.required && <span className="text-red-600"> *</span>}
            </label>
            {f.kind === 'textarea' ? (
              <textarea {...shared} rows={4} maxLength={f.maxLength} className="input" value={value} onChange={(e) => onChange(f.key, e.target.value)} />
            ) : f.kind === 'select' ? (
              <select {...shared} className="input" value={value} onChange={(e) => onChange(f.key, e.target.value)}>
                <option value="">Select…</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...shared}
                type={INPUT_TYPE[f.kind] ?? 'text'}
                inputMode={f.kind === 'year' ? 'numeric' : undefined}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                className="input"
                value={value}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
            {f.hint && !error && (
              <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
                {f.hint}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
