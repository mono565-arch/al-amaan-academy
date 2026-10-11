export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Accepts youtube.com/watch?v=, youtu.be/, youtube.com/embed/, /shorts/ and /live/ links. */
export function getYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] ?? null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
      } else {
        const match = url.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);
        id = match ? match[2] : null;
      }
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(value: string): string | null {
  const id = getYouTubeId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export const isDirectVideoFile = (value: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(value);

export function toDateSafe(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDate(value: unknown): string {
  const d = toDateSafe(value);
  return d ? d.toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
}

export function formatDateTime(value: unknown): string {
  const d = toDateSafe(value);
  return d ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

/** Splits events into upcoming and past. Admin-defined display order is kept inside each group. */
export function splitEvents<T extends { eventDate: string }>(events: T[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const event of events) {
    const d = toDateSafe(event.eventDate);
    if (d && d >= today) upcoming.push(event);
    else past.push(event);
  }
  return { upcoming, past };
}

export function errorMessage(err: unknown): string {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'permission-denied') {
    return 'Permission denied. Make sure you are signed in as an authorized administrator and that the Firestore rules are deployed.';
  }
  if (code === 'unavailable') return 'The network appears to be unavailable. Please check your connection and try again.';
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export function authErrorText(err: unknown): string {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'The email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/weak-password':
      return 'The new password is too weak. Use at least 8 characters.';
    case 'auth/requires-recent-login':
      return 'For security, please sign out, sign in again, and retry.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return errorMessage(err);
  }
}
