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

/**
 * Converts decimal hours (e.g., "1.5") to HH:mm format (e.g., "01:30")
 * Used to convert TimeVoucherData duration to format expected by EditScheduleModal
 * @param decimalHours - Duration as decimal hours string or number
 * @returns Duration in HH:mm format
 */
export function convertDecimalHoursToHHMM(decimalHours: string | number): string {
  try {
    const hours = typeof decimalHours === 'string' ? parseFloat(decimalHours) : decimalHours;
    if (isNaN(hours) || hours < 0) {
      return "00:00";
    }
    
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  } catch {
    return "00:00";
  }
}

/**
 * Formats a Date object to ISO 8601 date string (YYYY-MM-DD)
 * Used for converting Date objects to API-compatible format
 * @param date - Date object to format
 * @returns ISO date string in format YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Converts ISO date string (YYYY-MM-DD) to Date object
 * Used for converting API date strings to Date objects for date pickers
 * @param dateStr - ISO date string in format YYYY-MM-DD or other date string
 * @returns Date object or undefined if parsing fails
 */
export function convertToDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    // Check if it's already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }
    }
    // Fallback: try parsing as regular date string
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Parses date string in format "MMM dd, yyyy" or "MMM d, yyyy" to Date object
 * Used for parsing display date strings to Date objects for date comparisons and filtering
 * @param dateStr - Date string in format "MMM dd, yyyy" (e.g., "Nov 17, 2025") or "MMM d, yyyy" (e.g., "Nov 5, 2025")
 * @returns Date object or null if parsing fails
 */
export function parseDateString(dateStr: string): Date | null {
  try {
    // Try parsing with "MMM dd, yyyy" format (e.g., "Nov 17, 2025")
    const parsed = parse(dateStr, 'MMM dd, yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Try parsing with "MMM d, yyyy" format (e.g., "Nov 5, 2025")
    const parsed2 = parse(dateStr, 'MMM d, yyyy', new Date());
    if (isValid(parsed2)) {
      return parsed2;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Converts date string from various formats to ISO format (YYYY-MM-DD)
 * Handles formats like "MMM dd, yyyy" or "MMM d, yyyy" and converts to ISO
 * @param dateStr - Date string in various formats
 * @returns ISO date string (YYYY-MM-DD) or empty string if parsing fails
 */
export function convertToISOFormat(dateStr: string): string {
  if (!dateStr) return "";
  // If already in ISO format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    // Try parsing with double-digit day format first: "MMM dd, yyyy"
    let parsedDate = parse(dateStr, "MMM dd, yyyy", new Date());
    if (!isValid(parsedDate)) {
      // Try single-digit day format: "MMM d, yyyy"
      parsedDate = parse(dateStr, "MMM d, yyyy", new Date());
    }
    if (isValid(parsedDate)) {
      return formatDateToISO(parsedDate);
    }
  } catch (error) {
    console.warn("Failed to parse date:", dateStr, error);
  }
  // Fallback: try native Date parsing
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? formatDateToISO(date) : "";
}