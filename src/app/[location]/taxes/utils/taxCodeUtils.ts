import { format, parse } from "date-fns";
import { formatDisplayDate } from "@/utils/dateUtils";

// Business rule: if Start Date is not provided, backend should use this default.
// Also used to normalize odd "year 0002" values some backends return for "empty" dates.
export const DEFAULT_EMPTY_START_DATE = "Dec 02, 2002";

export function normalizeStartDateValue(value?: string): string {
  if (!value) return DEFAULT_EMPTY_START_DATE;
  // Handles odd values like "Dec 02, 0002" or ISO-like "0002-12-02"
  if (value.includes("0002")) return DEFAULT_EMPTY_START_DATE;
  return value;
}

export function resolveStartDateForApi(value?: string): string {
  // API expects a string like "Dec 29, 2025"; if empty, send default
  return value && value.trim() ? value : DEFAULT_EMPTY_START_DATE;
}

export function formatDateToApiDisplay(date: Date): string {
  // Backend examples: "Dec 29, 2025"
  return format(date, "MMM dd, yyyy");
}

export function formatStartDateForDisplay(value?: string): string {
  const normalized = normalizeStartDateValue(value);
  // If it's the agreed default string, display it as-is.
  if (normalized === DEFAULT_EMPTY_START_DATE) return DEFAULT_EMPTY_START_DATE;
  return formatDisplayDate(normalized);
}

/**
 * Sorting helper: convert a startDate string into a numeric value for chronological sorting.
 * Supports backend date strings like "Dec 29, 2025" and normalizes "empty" sentinel values.
 */
export function startDateSortValue(value?: string): number {
  const normalized = normalizeStartDateValue(value);

  // Try parsing the known backend format first
  const parsed = parse(normalized, "MMM dd, yyyy", new Date());
  const time = parsed.getTime();
  if (!Number.isNaN(time)) return time;

  // Fallback: attempt native Date parsing
  const fallback = new Date(normalized).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

export function compareStartDates(a?: string, b?: string): number {
  const av = startDateSortValue(a);
  const bv = startDateSortValue(b);
  if (av === bv) return 0;
  return av > bv ? 1 : -1;
}


