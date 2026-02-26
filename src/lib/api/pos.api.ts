/**
 * POS API Service
 * Handles all POS-related API calls
 */

export interface CreateTransactionResponse {
  success: boolean;
  data: {
    transactionId: string;
    transactionDate: string;
    locationId: number;
  };
}

export interface ItemLookupResponse {
  success: boolean;
  data: {
    id: string;
    code: string;
    description: string;
    price: number;
  };
}

/**
 * Create a new POS transaction
 * 
 * @param locationId - The location ID for the transaction
 * @returns Promise resolving to transaction data
 * 
 * @example
 * ```typescript
 * const transaction = await createPOSTransaction(1);
 * console.log(transaction.transactionId); // "P-001-1024"
 * ```
 */
export async function createPOSTransaction(
  locationId: number
): Promise<CreateTransactionResponse> {
  const response = await fetch('/admin/v2/api/pos/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ locationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }

  return response.json();
}

/**
 * Lookup an item by code
 * 
 * @param location - The location slug
 * @param code - The product code or UPC
 * @returns Promise resolving to item data
 * 
 * @example
 * ```typescript
 * const item = await lookupItem('training-location', 'book');
 * console.log(item.description); // "Book"
 * ```
 */
export async function lookupItem(
  location: string,
  code: string
): Promise<ItemLookupResponse> {
  const response = await fetch(`/admin/v2/api/pos/items?location=${encodeURIComponent(location)}&code=${encodeURIComponent(code)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to lookup item';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = `API returned ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
