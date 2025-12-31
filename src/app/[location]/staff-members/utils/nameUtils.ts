/**
 * Utility functions for name formatting in staff member components
 */

/**
 * Formats a full name from first and last name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name or empty string
 */
export function formatFullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "";
}

