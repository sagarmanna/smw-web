/**
 * Utility functions for parsing and formatting duration strings in HH:mm format
 */

/**
 * Parses a duration string (HH:mm) into hours and minutes
 * @param durationStr - Duration string in HH:mm format (e.g., "01:30")
 * @returns Object with hours and minutes as numbers
 */
export function parseDuration(durationStr: string): { hours: number; minutes: number } {
  if (!durationStr) return { hours: 0, minutes: 0 };
  const parts = durationStr.split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);
  return { hours, minutes };
}

/**
 * Formats hours and minutes into HH:mm string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Formatted duration string in HH:mm format
 */
export function formatDuration(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}


