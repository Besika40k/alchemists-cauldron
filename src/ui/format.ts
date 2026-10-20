import { toDisplaySeconds } from '../logic/timer';
import type { IRecipeRange } from '../types/game';

// U+2212, wider than a hyphen and read as "minus" by screen readers
const MINUS_SIGN: string = '−';

/**
 * A whole number with a real minus sign for negative values: 12 or −18.
 */
export function formatNumber(value: number): string {
  return value < 0 ? `${MINUS_SIGN}${String(Math.abs(value))}` : String(value);
}

/**
 * Formats a value with an explicit sign: +25, −18 (a real minus sign) or 0.
 */
export function formatSignedNumber(value: number): string {
  return value > 0 ? `+${String(value)}` : formatNumber(value);
}

/**
 * A recipe range as the task README writes it: 32..42 or −28..−18.
 */
export function formatRange(range: IRecipeRange): string {
  return `${formatNumber(range.min)}..${formatNumber(range.max)}`;
}

const SECONDS_IN_MINUTE: number = 60;

/**
 * The countdown label MM:SS; 150 000 ms reads as 02:30.
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds: number = toDisplaySeconds(Math.max(milliseconds, 0));
  const minutes: string = String(Math.floor(totalSeconds / SECONDS_IN_MINUTE)).padStart(2, '0');
  const seconds: string = String(totalSeconds % SECONDS_IN_MINUTE).padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * A result date as DD.MM.YYYY HH:MM in local time.
 */
export function formatDate(timestamp: number): string {
  const date: Date = new Date(timestamp);
  const day: string = `${twoDigits(date.getDate())}.${twoDigits(date.getMonth() + 1)}.${String(date.getFullYear())}`;

  return `${day} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}
