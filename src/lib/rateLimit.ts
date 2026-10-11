/** Simple per-browser cooldown that discourages repeated submissions. Server-side protection is described in the README. */
const COOLDOWN_MS = 60_000;

export function cooldownRemaining(key: string): number {
  try {
    const last = Number(localStorage.getItem(key) ?? 0);
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  } catch {
    return 0;
  }
}

export function markSubmitted(key: string): void {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* storage unavailable: ignore */
  }
}
