/**
 * POS localStorage utilities
 * Handles transaction ID persistence with error handling for private/incognito mode
 */

/**
 * Check if localStorage is available
 * Returns false in private/incognito mode or when disabled
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__pos_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stored transaction ID for a location
 * Returns null if not found or localStorage unavailable
 * 
 * @param location - The location slug
 * @returns Transaction ID or null
 */
export function getStoredTransactionId(location: string): string | null {
  try {
    const key = `pos_active_transaction_${location}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Store transaction ID for a location
 * Silently fails if localStorage unavailable
 * 
 * @param location - The location slug
 * @param transactionId - The transaction ID to store
 */
export function setStoredTransactionId(location: string, transactionId: string): void {
  try {
    const key = `pos_active_transaction_${location}`;
    localStorage.setItem(key, transactionId);
  } catch {
    // Silently fail
  }
}

/**
 * Clear stored transaction ID for a location
 * Silently fails if localStorage unavailable
 * 
 * @param location - The location slug
 */
export function clearStoredTransactionId(location: string): void {
  try {
    const key = `pos_active_transaction_${location}`;
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
