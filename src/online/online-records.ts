import type { Difficulty } from '../types/game';
import type { IOnlinePlayer, OnlineScoreResult } from '../types/online';

type MinigamesStore = typeof import('./minigames-store');

const loading: { store?: Promise<MinigamesStore> } = {};

async function importStore(): Promise<MinigamesStore> {
  try {
    return await import('./minigames-store');
  } catch (error: unknown) {
    delete loading.store;
    throw error;
  }
}

/**
 * Firebase is loaded with the first finished game, so the start of the game never
 * waits for it. A failed load is tried again with the next game.
 */
function loadStore(): Promise<MinigamesStore> {
  loading.store ??= importStore();

  return loading.store;
}

/**
 * Sends a finished game's score to MiniGames as the best score of the signed-in
 * player on its difficulty. It never throws: a failure is one of the results.
 */
export async function submitScore(
  difficulty: Difficulty,
  score: number,
): Promise<OnlineScoreResult> {
  if (score <= 0) {
    return { status: 'skipped' };
  }

  try {
    const store: MinigamesStore = await loadStore();
    const player: IOnlinePlayer | undefined = await store.getSignedInPlayer();

    return player === undefined
      ? { status: 'guest' }
      : await store.saveBestScore(player, difficulty, score);
  } catch {
    return { status: 'failed' };
  }
}
