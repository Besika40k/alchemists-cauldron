import type { IGameSave } from '../types/game';
import { readJson, removeItem, writeJson } from './safe-storage';

const SAVE_KEY: string = 'alchemists-cauldron:save';

/**
 * Keeps the unfinished game; a new game overwrites it.
 */
export function saveGame(save: IGameSave): void {
  writeJson(SAVE_KEY, save);
}

/**
 * The saved data as it is, not checked yet: `restoreGame` decides whether it can be used.
 */
export function loadGame(): unknown {
  return readJson(SAVE_KEY);
}

export function clearSave(): void {
  removeItem(SAVE_KEY);
}
