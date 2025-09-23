/**
 * Utility functions for text formatting and string operations
 */

/**
 * Formats a string by replacing hyphens with spaces and capitalizing each word
 * @param text - The text string (e.g., "training-location", "main-office")
 * @returns Formatted text string (e.g., "Training Location", "Main Office")
 * 
 * @example
 * formatLocationName("training-location") // "Training Location"
 * formatLocationName("main-office") // "Main Office"
 * formatLocationName("branch-1") // "Branch 1"
 */
export function formatLocationName(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Converts a formatted string to URL-friendly format (converts spaces to hyphens and lowercase)
 * @param text - The text string (e.g., "Training Location", "Main Office")
 * @returns URL-friendly string (e.g., "training-location", "main-office")
 * 
 * @example
 * formatForUrl("Training Location") // "training-location"
 * formatForUrl("Main Office") // "main-office"
 */
export function formatForUrl(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Gets a display-friendly name with fallback
 * @param text - The text string
 * @param fallback - Fallback text if input is empty
 * @returns Formatted text or fallback
 * 
 * @example
 * getDisplayName("training-location") // "Training Location"
 * getDisplayName("", "Unknown Location") // "Unknown Location"
 */
export function getDisplayName(text: string, fallback: string = 'Location'): string {
  return text ? formatLocationName(text) : fallback;
}
