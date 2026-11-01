import type { Difficulty } from './game';

/**
 * The MiniGames account signed in on this site.
 */
export interface IOnlinePlayer {
  readonly userId: string;
  /**
   * The name MiniGames shows: the profile name, else the part of the email before the @.
   */
  readonly name: string;
}

/**
 * The best score of a player on one difficulty, as MiniGames keeps it.
 */
export interface IOnlineRecord {
  readonly userId: string;
  readonly playerName: string;
  readonly score: number;
  readonly difficulty: Difficulty;
}

/**
 * What became of a finished game's score on MiniGames:
 * - `skipped`: a score of 0 is not sent;
 * - `guest`: nobody is signed in to MiniGames;
 * - `saved`: a new best of the player on this difficulty;
 * - `kept`: the player's best on this difficulty is higher or equal and stays;
 * - `failed`: MiniGames could not be reached or refused the score.
 */
export type OnlineScoreResult =
  | { readonly status: 'skipped' }
  | { readonly status: 'guest' }
  | { readonly status: 'saved'; readonly playerName: string }
  | { readonly status: 'kept'; readonly playerName: string; readonly best: number }
  | { readonly status: 'failed' };
