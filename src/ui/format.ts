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
