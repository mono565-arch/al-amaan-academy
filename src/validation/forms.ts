import { isValidHttpUrl } from '../lib/utils';

export type FieldKind = 'text' | 'textarea' | 'url' | 'email' | 'phone' | 'date' | 'datetime' | 'year' | 'select' | 'checkbox';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: readonly string[];
  maxLength?: number;
  placeholder?: string;
  hint?: string;
}

export type FormValues = Record<string, string | boolean>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

export function initialValues(fields: FieldDef[], source?: Record<string, unknown>): FormValues {
  const out: FormValues = {};
  for (const f of fields) {
    const raw = source?.[f.key];
    if (f.kind === 'checkbox') out[f.key] = raw === true;
    else out[f.key] = raw === undefined || raw === null ? '' : String(raw);
  }
  return out;
}

export function validateValues(fields: FieldDef[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.kind === 'checkbox') continue;
    const raw = values[f.key];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (f.required && !value) {
      errors[f.key] = 'This field is required.';
      continue;
    }
    if (!value) continue;
    if (f.maxLength && value.length > f.maxLength) {
      errors[f.key] = `Please keep this under ${f.maxLength} characters.`;
      continue;
    }
    switch (f.kind) {
      case 'url':
        if (!isValidHttpUrl(value)) errors[f.key] = 'Enter a full web address starting with https://';
        break;
      case 'email':
        if (!EMAIL_RE.test(value)) errors[f.key] = 'Enter a valid email address.';
        break;
      case 'phone':
        if (!PHONE_RE.test(value)) errors[f.key] = 'Enter a valid phone number (digits, spaces, +, - and brackets only).';
        break;
      case 'year': {
        const n = Number(value);
        if (!/^\d{4}$/.test(value) || n < 1900 || n > 2100) errors[f.key] = 'Enter a four-digit year.';
        break;
      }
      case 'date':
        if (isNaN(Date.parse(value))) errors[f.key] = 'Enter a valid date.';
        break;
      case 'datetime':
        if (isNaN(Date.parse(value))) errors[f.key] = 'Enter a valid date and time.';
        break;
    }
  }
  return errors;
}

export function toPayload(fields: FieldDef[], values: FormValues): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = values[f.key];
    out[f.key] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export const SETTINGS_FIELDS: FieldDef[] = [
  { key: 'academyName', label: 'Academy name', kind: 'text', required: true, maxLength: 120 },
  { key: 'tagline', label: 'Tagline', kind: 'text', maxLength: 160 },
  { key: 'welcomeMessage', label: 'Homepage welcome message', kind: 'text', maxLength: 160 },
  { key: 'logoUrl', label: 'Logo image URL', kind: 'url' },
  { key: 'faviconUrl', label: 'Favicon image URL', kind: 'url' },
  { key: 'introduction', label: 'Academy introduction', kind: 'textarea', maxLength: 3000 },
  { key: 'history', label: 'History', kind: 'textarea', maxLength: 3000 },
  { key: 'mission', label: 'Mission', kind: 'textarea', maxLength: 2000 },
  { key: 'vision', label: 'Vision', kind: 'textarea', maxLength: 2000 },
  { key: 'educationalApproach', label: 'Educational approach', kind: 'textarea', maxLength: 3000 },
  { key: 'phone', label: 'Phone number', kind: 'phone' },
  { key: 'email', label: 'Email address', kind: 'email' },
  { key: 'address', label: 'Academy address', kind: 'textarea', maxLength: 500 },
  { key: 'mapUrl', label: 'Google Maps link', kind: 'url' },
  { key: 'whatsappUrl', label: 'WhatsApp link (e.g. https://wa.me/923001234567)', kind: 'url' },
  { key: 'facebookUrl', label: 'Facebook link', kind: 'url' },
  { key: 'instagramUrl', label: 'Instagram link', kind: 'url' },
  { key: 'youtubeUrl', label: 'YouTube link', kind: 'url' },
  { key: 'footerText', label: 'Footer text', kind: 'textarea', maxLength: 300 },
];

export const PERSON_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Full name', kind: 'text', required: true, maxLength: 120 },
  { key: 'position', label: 'Position / subject', kind: 'text', maxLength: 160 },
  { key: 'qualifications', label: 'Qualifications', kind: 'textarea', maxLength: 1500 },
  { key: 'experience', label: 'Experience', kind: 'textarea', maxLength: 1500 },
  { key: 'bio', label: 'Short biography', kind: 'textarea', required: true, maxLength: 3000 },
  { key: 'photoUrl', label: 'Photo URL', kind: 'url', hint: 'Paste a direct link to an image (https://…).' },
  { key: 'additionalInfo', label: 'Additional information', kind: 'textarea', maxLength: 1500 },
  { key: 'published', label: 'Publish on website', kind: 'checkbox' },
];

export const EVENT_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', kind: 'text', required: true, maxLength: 150 },
  { key: 'eventDate', label: 'Date and time', kind: 'datetime', required: true },
  { key: 'location', label: 'Location', kind: 'text', maxLength: 200 },
  { key: 'description', label: 'Description', kind: 'textarea', required: true, maxLength: 3000 },
  { key: 'imageUrl', label: 'Image URL', kind: 'url' },
  { key: 'videoUrl', label: 'Video URL', kind: 'url', hint: 'YouTube link or direct .mp4 link.' },
  { key: 'published', label: 'Publish on website', kind: 'checkbox' },
];

export const ACHIEVEMENT_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', kind: 'text', required: true, maxLength: 150 },
  { key: 'year', label: 'Year', kind: 'year', required: true },
  { key: 'description', label: 'Description', kind: 'textarea', maxLength: 2000 },
  { key: 'imageUrl', label: 'Image URL', kind: 'url' },
  { key: 'published', label: 'Publish on website', kind: 'checkbox' },
];

export const GALLERY_FIELDS: FieldDef[] = [
  { key: 'mediaType', label: 'Media type', kind: 'select', required: true, options: ['image', 'video'] },
  { key: 'url', label: 'Image or video URL', kind: 'url', required: true, hint: 'Direct image link, YouTube link, or direct .mp4 link.' },
  { key: 'title', label: 'Title', kind: 'text', maxLength: 150 },
  { key: 'caption', label: 'Caption', kind: 'textarea', maxLength: 500 },
  { key: 'category', label: 'Category', kind: 'text', maxLength: 80, placeholder: 'e.g. Campus, Sports, Ceremonies' },
  { key: 'published', label: 'Publish on website', kind: 'checkbox' },
];

export const ADMISSION_FIELDS: FieldDef[] = [
  { key: 'studentName', label: 'Student full name', kind: 'text', required: true, maxLength: 120 },
  { key: 'dateOfBirth', label: 'Date of birth', kind: 'date', required: true },
  { key: 'gender', label: 'Gender', kind: 'select', options: GENDER_OPTIONS },
  { key: 'guardianName', label: 'Parent / guardian name', kind: 'text', required: true, maxLength: 120 },
  { key: 'guardianPhone', label: 'Parent / guardian phone', kind: 'phone', required: true },
  { key: 'email', label: 'Email address (optional)', kind: 'email', maxLength: 200 },
  { key: 'gradeApplied', label: 'Applying for class / grade', kind: 'text', required: true, maxLength: 80 },
  { key: 'previousSchool', label: 'Previous school (if any)', kind: 'text', maxLength: 160 },
  { key: 'address', label: 'Home address', kind: 'textarea', required: true, maxLength: 500 },
  { key: 'notes', label: 'Additional notes', kind: 'textarea', maxLength: 1000 },
];

export const FEEDBACK_FIELDS: FieldDef[] = [
  { key: 'kind', label: 'Type', kind: 'select', required: true, options: ['Feedback', 'Complaint'] },
  { key: 'anonymous', label: 'Submit anonymously', kind: 'checkbox' },
  { key: 'name', label: 'Your name', kind: 'text', maxLength: 120 },
  { key: 'contact', label: 'Contact (optional)', kind: 'text', maxLength: 200, hint: 'Phone or email, if you would like a reply.' },
  { key: 'subject', label: 'Subject', kind: 'text', required: true, maxLength: 150 },
  { key: 'message', label: 'Message', kind: 'textarea', required: true, maxLength: 3000 },
];
