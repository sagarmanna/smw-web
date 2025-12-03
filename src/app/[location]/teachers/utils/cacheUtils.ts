/**
 * Cache utility functions for teacher data
 */

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
export const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Checks if cached data is still fresh
 */
export function isCacheFresh(
  lastFetched: number | null,
  staleTimeMs: number = STALE_TIME_MS
): boolean {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < staleTimeMs;
}

/**
 * Creates a cache key for time voucher data based on location, teacher ID, and query parameters
 */
export function createTimeVoucherCacheKey(
  location: string,
  teacherId: number,
  startDate: string,
  endDate: string,
  summaryOnly: boolean
): string {
  return `${location}-${teacherId}-${startDate}-${endDate}-${summaryOnly}`;
}

