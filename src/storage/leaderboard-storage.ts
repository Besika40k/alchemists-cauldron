import { isValidPlayerName, sortEntries } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../types/game';
import { readJson, removeItem, writeJson } from './safe-storage';

const LEADERBOARD_KEY: string = 'alchemists-cauldron:leaderboard';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Only well-formed results survive a load, so edited or broken data never reaches the screen.
 */
export function isLeaderboardEntry(value: unknown): value is ILeaderboardEntry {
  return (
    isRecord(value) &&
    typeof value['name'] === 'string' &&
    isValidPlayerName(value['name']) &&
    Number.isSafeInteger(value['score']) &&
    Number(value['score']) >= 0 &&
    Number.isFinite(value['date']) &&
    Number(value['date']) > 0
  );
}

export function loadLeaderboard(): readonly ILeaderboardEntry[] {
  const data: unknown = readJson(LEADERBOARD_KEY);

  return Array.isArray(data)
    ? sortEntries(data.filter((item: unknown) => isLeaderboardEntry(item)))
    : [];
}

export function saveLeaderboard(entries: readonly ILeaderboardEntry[]): void {
  writeJson(LEADERBOARD_KEY, entries);
}

export function clearLeaderboard(): void {
  removeItem(LEADERBOARD_KEY);
}
