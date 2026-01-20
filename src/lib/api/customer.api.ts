import { apiClient } from './client';

/**
 * Customer email data structure
 */
export interface CustomerEmailData {
  id: number;
  email: string;
  note?: string;
  label: string;
  isPrimary: boolean;
}

/**
 * API response structure for customer info endpoint
 * Matches the structure used in customers.api.ts
 */
interface CustomerInfoResponse {
  success: boolean;
  message: string;
  data: {
    email?: CustomerEmailData[];
    profile?: {
      name: string;
      role: string;
      referralSource: string;
      status: string;
    };
    phone?: Array<{
      id: number;
      number: string;
      extension?: number;
      note?: string;
      label: string;
      isPrimary: boolean;
    }>;
    addresses?: Array<unknown>;
    discount?: unknown;
    openingBalance?: unknown;
    paymentPreference?: unknown;
  };
}

/**
 * Get customer's email addresses
 * 
 * This is a reusable API function that can be used across the application
 * to fetch customer emails by customer ID.
 * 
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise resolving to an array of customer email data, or empty array on error
 * 
 * @example
 * ```typescript
 * const emails = await getCustomerEmails('training-location', 123);
 * const emailAddresses = emails.map(e => e.email);
 * ```
 */
export async function getCustomerEmails(
  location: string,
  customerId: number
): Promise<CustomerEmailData[]> {
  try {
    const response = await apiClient.get<CustomerInfoResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`
    );

    if (response.data.success && response.data.data?.email) {
      const emails = response.data.data.email;
      // Ensure it's an array
      if (Array.isArray(emails)) {
        return emails;
      }
      // If it's a single object, wrap it in an array (fallback)
      if (emails && typeof emails === 'object' && !Array.isArray(emails)) {
        return [emails as CustomerEmailData];
      }
    }

    return [];
  } catch (error) {
    console.error('Error fetching customer emails:', error);
    return [];
  }
}

/**
 * Get customer email addresses as a simple string array
 * 
 * Convenience function that returns only the email addresses (strings)
 * instead of the full email data objects.
 * 
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise resolving to an array of email address strings
 * 
 * @example
 * ```typescript
 * const emailAddresses = await getCustomerEmailAddresses('training-location', 123);
 * // Returns: ['customer@example.com', 'secondary@example.com']
 * ```
 */
export async function getCustomerEmailAddresses(
  location: string,
  customerId: number
): Promise<string[]> {
  try {
    const emails = await getCustomerEmails(location, customerId);
    return emails
      .map((e) => e.email)
      .filter((email) => email && email.trim() !== '');
  } catch (error) {
    console.error('Error fetching customer email addresses:', error);
    return [];
  }
}
