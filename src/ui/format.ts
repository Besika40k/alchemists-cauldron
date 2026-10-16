// U+2212, wider than a hyphen and read as "minus" by screen readers
const MINUS_SIGN: string = '−';

/**
 * Formats a value with an explicit sign: +25, −18 (a real minus sign) or 0.
 */
export function formatSignedNumber(value: number): string {
  if (value > 0) {
    return `+${String(value)}`;
  }

  return value < 0 ? `${MINUS_SIGN}${String(Math.abs(value))}` : '0';
}
