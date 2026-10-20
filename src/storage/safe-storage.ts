/**
 * localStorage can be missing, full, blocked by the browser or hold broken text.
 * These helpers never throw: a failed read gives `undefined`, a failed write is
 * skipped, and the game goes on.
 */

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readJson(key: string): unknown {
  try {
    const text: string | null | undefined = getStorage()?.getItem(key);

    return typeof text === 'string' ? (JSON.parse(text) as unknown) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    getStorage()?.setItem(key, JSON.stringify(value));
  } catch {
    // a full or blocked storage only loses this write
  }
}

export function removeItem(key: string): void {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // a blocked storage keeps the old value, the game goes on
  }
}
