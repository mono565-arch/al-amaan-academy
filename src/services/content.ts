import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { SiteSettings } from '../types';

export class NotConfiguredError extends Error {
  constructor() {
    super('Firebase is not configured. Add your VITE_FIREBASE_* values to .env.local and restart the dev server.');
    this.name = 'NotConfiguredError';
  }
}

export function requireDb() {
  if (!db) throw new NotConfiguredError();
  return db;
}

export interface ListenOptions {
  publishedOnly?: boolean;
  orderField?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
}

/** Real-time listener for a Firestore collection. Returns an unsubscribe function. */
export function listenCollection<T extends { id: string }>(
  name: string,
  onData: (items: T[]) => void,
  onError: (err: Error) => void,
  opts: ListenOptions = {},
): () => void {
  const database = requireDb();
  const constraints: QueryConstraint[] = [];
  if (opts.publishedOnly) constraints.push(where('published', '==', true));
  constraints.push(orderBy(opts.orderField ?? 'order', opts.direction ?? 'asc'));
  if (opts.limit) constraints.push(limitTo(opts.limit));

  return onSnapshot(
    query(collection(database, name), ...constraints),
    (snap) => onData(snap.docs.map((d) => ({ ...(d.data() as Omit<T, 'id'>), id: d.id }) as T)),
    (err) => onError(err),
  );
}

export function listenSettings(
  onData: (settings: Partial<SiteSettings> | null) => void,
  onError: (err: Error) => void,
): () => void {
  return onSnapshot(
    doc(requireDb(), 'settings', 'site'),
    (snap) => onData(snap.exists() ? (snap.data() as Partial<SiteSettings>) : null),
    (err) => onError(err),
  );
}

export async function saveSettings(data: Record<string, string | boolean>): Promise<void> {
  await setDoc(doc(requireDb(), 'settings', 'site'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function createRecord(name: string, data: Record<string, unknown>): Promise<string> {
  const ref = await addDoc(collection(requireDb(), name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRecord(name: string, id: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(requireDb(), name, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRecord(name: string, id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), name, id));
}

/** Rewrites display order as 1..n for the given ids, in one atomic batch. */
export async function reorderRecords(name: string, orderedIds: string[]): Promise<void> {
  const database = requireDb();
  const batch = writeBatch(database);
  orderedIds.forEach((id, index) => batch.update(doc(database, name, id), { order: index + 1 }));
  await batch.commit();
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  const database = requireDb();
  const batch = writeBatch(database);
  ids.forEach((id) => batch.update(doc(database, 'notifications', id), { read: true }));
  await batch.commit();
}
