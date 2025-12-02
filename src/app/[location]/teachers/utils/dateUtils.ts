/**
 * Utility functions for date formatting in teacher components
 */

/**
 * Formats a date string for teacher details card.
 * Business requirement: display as `Feb 01, 2006` (MMM DD, YYYY).
 * @param value - Date string or undefined
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDisplayDate(value?: string): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

