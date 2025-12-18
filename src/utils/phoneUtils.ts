/**
 * Phone number formatting utilities
 */

/**
 * Formats a phone number string to (XXX) XXX-XXXX format
 * @param value - The phone number string (can contain non-digit characters)
 * @returns Formatted phone number string
 * @example
 * formatPhoneNumber("1234567890") // "(123) 456-7890"
 * formatPhoneNumber("(123) 456-7890") // "(123) 456-7890"
 * formatPhoneNumber("123") // "123"
 * formatPhoneNumber("123456") // "(123) 456"
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

/**
 * Parses a formatted phone number to digits only
 * @param formatted - The formatted phone number string
 * @returns Phone number with only digits
 * @example
 * parsePhoneNumber("(123) 456-7890") // "1234567890"
 */
export const parsePhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, "");
};

/**
 * Validates if a phone number has 10 digits
 * @param phone - The phone number string (formatted or unformatted)
 * @returns True if phone number has exactly 10 digits
 * @example
 * validatePhoneNumber("(123) 456-7890") // true
 * validatePhoneNumber("1234567890") // true
 * validatePhoneNumber("123456789") // false
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = parsePhoneNumber(phone);
  return cleaned.length === 10;
};


