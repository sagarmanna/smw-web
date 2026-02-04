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

/**
 * Splits a full name into first and last name using "last word is surname" heuristic.
 * Used when API returns only a combined name (no firstname/lastname from backend).
 * Note: Culture-specific - works for Western "Given Family" order; may fail for "Family Given" names.
 *
 * @param fullName - Combined full name string
 * @returns Object with firstName and lastName
 */
export function splitFullNameToFirstLast(fullName: string): { firstName: string; lastName: string } {
  const nameParts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (nameParts.length <= 1) {
    return {
      firstName: nameParts[0] ?? "",
      lastName: "",
    };
  }
  return {
    firstName: nameParts.slice(0, -1).join(" "),
    lastName: nameParts[nameParts.length - 1] ?? "",
  };
}

