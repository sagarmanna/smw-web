/**
 * Tax rate helpers
 *
 * Centralizes parsing + validation so forms don't duplicate logic.
 */

export function toTwoDecimalNumber(value: string): number {
  const num = Number(value);
  if (Number.isNaN(num)) return NaN;
  return Math.round(num * 100) / 100;
}

export function hasAtMostTwoDecimals(value: string): boolean {
  // Accept integers and up to 2 decimal places
  // e.g. "18", "18.0", "18.00" => ok; "18.123" => not ok
  return /^-?\d+(\.\d{1,2})?$/.test(value.trim());
}

export function validateRateInput(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) {
    return "Rate cannot be blank.";
  }

  const str = String(value).trim();
  const num = Number(str);

  if (Number.isNaN(num)) return "Rate must be a number.";
  if (!hasAtMostTwoDecimals(str)) return "Rate must have at most 2 decimal places.";
  if (num < 0 || num > 100) return "Rate must be between 0 and 100.";

  return null;
}


