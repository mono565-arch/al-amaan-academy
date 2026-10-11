import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { requireDb } from './content';

const ADMISSION_KEYS = [
  'studentName', 'dateOfBirth', 'gender', 'guardianName', 'guardianPhone', 'email',
  'gradeApplied', 'previousSchool', 'address', 'notes',
] as const;

const FEEDBACK_KEYS = ['kind', 'name', 'anonymous', 'contact', 'subject', 'message'] as const;

function pick(data: Record<string, string | boolean>, keys: readonly string[]) {
  const out: Record<string, string | boolean> = {};
  for (const k of keys) out[k] = data[k] ?? '';
  return out;
}

/** Saves an application and an admin notification together, so neither can exist without the other. */
export async function submitAdmission(data: Record<string, string | boolean>): Promise<void> {
  const database = requireDb();
  const batch = writeBatch(database);
  const ref = doc(collection(database, 'admissions'));
  batch.set(ref, { ...pick(data, ADMISSION_KEYS), status: 'New', createdAt: serverTimestamp() });

  const note = doc(collection(database, 'notifications'));
  batch.set(note, {
    type: 'admission',
    title: 'New admission application',
    message: `${String(data.studentName)} · ${String(data.gradeApplied)}`,
    link: `/admin/admissions?id=${ref.id}`,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function submitFeedback(data: Record<string, string | boolean>): Promise<void> {
  const database = requireDb();
  const batch = writeBatch(database);
  const ref = doc(collection(database, 'feedback'));
  batch.set(ref, { ...pick(data, FEEDBACK_KEYS), status: 'New', read: false, createdAt: serverTimestamp() });

  const note = doc(collection(database, 'notifications'));
  batch.set(note, {
    type: 'feedback',
    title: data.kind === 'Complaint' ? 'New complaint received' : 'New feedback received',
    message: String(data.subject),
    link: `/admin/feedback?id=${ref.id}`,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}
