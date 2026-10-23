import { DIFFICULTIES } from '../data/difficulty';
import { isValidPlayerName, sortEntries } from '../logic/leaderboard';
import type { Difficulty, ILeaderboardEntry } from '../types/game';
import { readJson, removeItem, writeJson } from './safe-storage';

const LEADERBOARD_KEY: string = 'alchemists-cauldron:leaderboard';

function getListKey(difficulty: Difficulty): string {
  return `${LEADERBOARD_KEY}:${difficulty}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const DIFFICULTY_NAMES: ReadonlySet<string> = new Set<string>(DIFFICULTIES);

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTY_NAMES.has(value);
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
    Number(value['date']) > 0 &&
    isDifficulty(value['difficulty'])
  );
}

/**
 * Level 1 kept one list without difficulties, and every game in it was played on Medium.
 */
function readLevel1Results(): unknown {
  const data: unknown = readJson(LEADERBOARD_KEY);

  return Array.isArray(data)
    ? data.map((item: unknown): unknown =>
        isRecord(item) ? { ...item, difficulty: 'medium' } : item,
      )
    : undefined;
}

export function loadLeaderboard(difficulty: Difficulty): readonly ILeaderboardEntry[] {
  const data: unknown =
    readJson(getListKey(difficulty)) ?? (difficulty === 'medium' ? readLevel1Results() : undefined);

  return Array.isArray(data)
    ? sortEntries(
        data.filter(
          (item: unknown): item is ILeaderboardEntry =>
            isLeaderboardEntry(item) && item.difficulty === difficulty,
        ),
      )
    : [];
}

export function saveLeaderboard(
  difficulty: Difficulty,
  entries: readonly ILeaderboardEntry[],
): void {
  writeJson(getListKey(difficulty), entries);
}

export function clearLeaderboard(difficulty: Difficulty): void {
  removeItem(getListKey(difficulty));

  // the old Level 1 list would come back as the Medium list otherwise
  if (difficulty === 'medium') {
    removeItem(LEADERBOARD_KEY);
  }
}
