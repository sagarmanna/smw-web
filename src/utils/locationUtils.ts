/**
 * Utility functions for location-related operations
 */

/**
 * Formats a location string by replacing hyphens with spaces and capitalizing each word
 * @param location - The location string (e.g., "training-location", "main-office")
 * @returns Formatted location string (e.g., "Training Location", "Main Office")
 * 
 * @example
 * formatLocationName("training-location") // "Training Location"
 * formatLocationName("main-office") // "Main Office"
 * formatLocationName("branch-1") // "Branch 1"
 */
export function formatLocationName(location: string): string {
  if (!location) return '';
  
  return location
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Formats a location string for use in URLs (converts spaces to hyphens and lowercase)
 * @param location - The location string (e.g., "Training Location", "Main Office")
 * @returns URL-friendly location string (e.g., "training-location", "main-office")
 * 
 * @example
 * formatLocationForUrl("Training Location") // "training-location"
 * formatLocationForUrl("Main Office") // "main-office"
 */
export function formatLocationForUrl(location: string): string {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Gets a display-friendly location name with fallback
 * @param location - The location string
 * @param fallback - Fallback text if location is empty
 * @returns Formatted location name or fallback
 * 
 * @example
 * getLocationDisplayName("training-location") // "Training Location"
 * getLocationDisplayName("", "Unknown Location") // "Unknown Location"
 */
export function getLocationDisplayName(location: string, fallback: string = 'Location'): string {
  return location ? formatLocationName(location) : fallback;
}
