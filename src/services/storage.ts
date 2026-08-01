/** Typed, failure-tolerant localStorage access (private mode / quota can throw). */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the app stays usable, only persistence is lost.
  }
}

export function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignored
  }
}
