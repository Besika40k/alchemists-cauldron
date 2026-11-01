import { getAuth, type Auth, type User } from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type DocumentReference,
  type DocumentSnapshot,
} from 'firebase/firestore/lite';
import { MINIGAMES_GAME_SLUG, ONLINE_NAME_MAX_LENGTH } from '../data/online';
import type { Difficulty } from '../types/game';
import type { IOnlinePlayer, IOnlineRecord, OnlineScoreResult } from '../types/online';
import { getFirebaseApp } from './firebase-app';

/**
 * The name MiniGames shows, by the same rule: the profile name, else the part of
 * the email before the @, as a Google account may have no name.
 */
function getPlayerName(user: User): string {
  const name: string = user.displayName?.trim() ?? '';
  const email: string = user.email ?? '';
  const shown: string = name === '' ? (email.split('@', 1)[0] ?? '') : name;

  return [...shown].slice(0, ONLINE_NAME_MAX_LENGTH).join('');
}

/**
 * The MiniGames account signed in on this site, once Firebase has read the saved
 * sign-in, or undefined for a guest.
 */
export async function getSignedInPlayer(): Promise<IOnlinePlayer | undefined> {
  const auth: Auth = getAuth(getFirebaseApp());

  await auth.authStateReady();

  const user: User | null = auth.currentUser;

  return user === null ? undefined : { userId: user.uid, name: getPlayerName(user) };
}

/**
 * Every player has one record per difficulty, named by the user id and the
 * difficulty, so the Firestore rules can tell whose it is and keep only a
 * higher score.
 */
function getRecordReference(player: IOnlinePlayer, difficulty: Difficulty): DocumentReference {
  return doc(
    getFirestore(getFirebaseApp()),
    'games',
    MINIGAMES_GAME_SLUG,
    'records',
    `${player.userId}_${difficulty}`,
  );
}

function readBestScore(snapshot: DocumentSnapshot): number | undefined {
  const score: unknown = snapshot.data()?.['score'];

  return typeof score === 'number' ? score : undefined;
}

/**
 * Saves the score as the player's best on the difficulty, unless their best is
 * already as high.
 */
export async function saveBestScore(
  player: IOnlinePlayer,
  difficulty: Difficulty,
  score: number,
): Promise<OnlineScoreResult> {
  const reference: DocumentReference = getRecordReference(player, difficulty);
  const best: number | undefined = readBestScore(await getDoc(reference));

  if (best !== undefined && best >= score) {
    return { status: 'kept', playerName: player.name, best };
  }

  const record: IOnlineRecord = {
    userId: player.userId,
    playerName: player.name,
    score,
    difficulty,
  };

  await setDoc(reference, { ...record, achievedAt: serverTimestamp() });

  return { status: 'saved', playerName: player.name };
}
