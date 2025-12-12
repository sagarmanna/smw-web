/**
 * Utility functions for date formatting and conversion
 */

import { parse, format, isValid } from "date-fns";

/**
 * Formats a date string for display.
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

/**
 * Parses API date format "Apr 14, 2018 at 12:00 AM" to ISO string
 * Used to transform API data - stores as ISO for easy Date conversion
 * @param dateTimeStr - Date string from API in format "MMM dd, yyyy 'at' h:mm a"
 * @returns ISO string that can be directly converted to Date: new Date(isoString)
 */
export function parseApiDateTimeToISO(dateTimeStr: string): string {
  try {
    // Try parsing with double-digit day format: "Apr 14, 2018 at 12:00 AM"
    let parsedDate = parse(dateTimeStr, "MMM dd, yyyy 'at' h:mm a", new Date());
    if (isNaN(parsedDate.getTime())) {
      // Try parsing with single-digit day format: "Apr 4, 2018 at 12:00 AM"
      parsedDate = parse(dateTimeStr, "MMM d, yyyy 'at' h:mm a", new Date());
    }
    
    if (!isNaN(parsedDate.getTime())) {
      // Return ISO string - can be directly converted to Date: new Date(isoString)
      return parsedDate.toISOString();
    }
  } catch (error) {
    console.warn("Failed to parse API date:", dateTimeStr, error);
  }
  // Return original if parsing fails
  return dateTimeStr;
}

/**
 * Formats ISO string to display format "MMM dd, yyyy h:mm a"
 * Used in table columns for display
 */
export function formatISOToDisplay(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return format(date, "MMM dd, yyyy h:mm a");
    }
  } catch (error) {
    console.warn("Failed to format ISO date:", isoString, error);
  }
  return isoString;
}

/**
 * Converts ISO string to Date object
 * Used in Modal to populate form fields - no parsing needed, direct conversion
 */
export function isoStringToDate(isoString: string): Date | null {
  try {
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    console.warn("Failed to convert ISO string to Date:", isoString, error);
  }
  return null;
}

/**
 * Parses time string from TimeVoucherData format
 * Handles formats like "Wednesday, November 5th, 2025 04:00 PM"
 * @param timeStr - Time string with ordinal suffixes (st, nd, rd, th)
 * @returns Parsed Date object or null if parsing fails
 */
export function parseTimeVoucherString(timeStr: string): Date | null {
  try {
    // Remove ordinal suffixes (st, nd, rd, th)
    const cleaned = timeStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');
    
    // Try multiple date formats
    const formats = [
      "EEEE, MMMM d, yyyy h:mm a", // "Wednesday, November 5, 2025 04:00 PM"
      "EEEE, MMMM d, yyyy", // "Wednesday, November 5, 2025"
      "MMMM d, yyyy h:mm a", // "November 5, 2025 04:00 PM"
      "MMMM d, yyyy", // "November 5, 2025"
    ];
    
    for (const formatStr of formats) {
      const parsed = parse(cleaned, formatStr, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

