/**
 * Utility functions for date formatting in teacher components
 */

/**
 * Formats a date string to a readable format
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
    day: "numeric",
  });
}

