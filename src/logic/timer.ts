export const MILLISECONDS_IN_SECOND: number = 1000;

export function secondsToMilliseconds(seconds: number): number {
  return seconds * MILLISECONDS_IN_SECOND;
}

/**
 * The time left is always computed from timestamps, never by counting ticks, so
 * it stays right after the browser slowed or stopped a background tab.
 */
export function getRemainingTime(endTime: number, now: number): number {
  return Math.max(endTime - now, 0);
}

/**
 * The whole seconds a countdown shows: 1.5 s left still reads as 2 s.
 */
export function toDisplaySeconds(milliseconds: number): number {
  return Math.ceil(milliseconds / MILLISECONDS_IN_SECOND);
}

/**
 * Adds the bonus of a good brew, but never above the start time of the difficulty.
 */
export function addTimeBonus(timeLeft: number, bonusSeconds: number, startSeconds: number): number {
  return Math.min(
    timeLeft + secondsToMilliseconds(bonusSeconds),
    secondsToMilliseconds(startSeconds),
  );
}
