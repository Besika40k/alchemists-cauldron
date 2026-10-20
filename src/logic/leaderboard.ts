import type { ILeaderboardEntry } from '../types/game';

export const LEADERBOARD_SIZE: number = 10;

export const PLAYER_NAME_MIN_LENGTH: number = 2;
export const PLAYER_NAME_MAX_LENGTH: number = 15;

// letters of any alphabet, digits, space, _ and -
const PLAYER_NAME_PATTERN: RegExp = /^[\p{L}\p{N} _-]+$/u;

export function normalizePlayerName(name: string): string {
  return name.trim();
}

/**
 * 2 to 15 characters: letters, digits, space, _ and -. Spaces around the name do
 * not count.
 */
export function isValidPlayerName(name: string): boolean {
  const normalized: string = normalizePlayerName(name);
  const length: number = [...normalized].length;

  return (
    length >= PLAYER_NAME_MIN_LENGTH &&
    length <= PLAYER_NAME_MAX_LENGTH &&
    PLAYER_NAME_PATTERN.test(normalized)
  );
}

/**
 * Higher score first; for equal scores the earlier result stays higher.
 */
export function compareEntries(first: ILeaderboardEntry, second: ILeaderboardEntry): number {
  return second.score - first.score || first.date - second.date;
}

export function sortEntries(entries: readonly ILeaderboardEntry[]): ILeaderboardEntry[] {
  return entries.toSorted(compareEntries).slice(0, LEADERBOARD_SIZE);
}

/**
 * A score enters the Top-10 while the list has room, or when it beats the last
 * result; an equal score does not push an earlier result out.
 */
export function isLeaderboardScore(entries: readonly ILeaderboardEntry[], score: number): boolean {
  const sorted: readonly ILeaderboardEntry[] = sortEntries(entries);
  const last: ILeaderboardEntry | undefined = sorted[LEADERBOARD_SIZE - 1];

  return last === undefined || score > last.score;
}

export interface ILeaderboardInsert {
  readonly entries: readonly ILeaderboardEntry[];
  /**
   * The place of the new result, 1 to 10, or 0 when it did not make the list.
   */
  readonly rank: number;
}

export function insertEntry(
  entries: readonly ILeaderboardEntry[],
  entry: ILeaderboardEntry,
): ILeaderboardInsert {
  const sorted: readonly ILeaderboardEntry[] = sortEntries([...entries, entry]);

  return { entries: sorted, rank: sorted.indexOf(entry) + 1 };
}
