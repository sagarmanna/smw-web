/**
 * POS API Service
 * Handles all POS-related API calls
 */

export interface CreateTransactionResponse {
  success: boolean;
  data: {
    transactionId: string;
    numericTransactionId: string;
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

export interface AddLineItemResponse {
  success: boolean;
  data: {
    id: string;
    transactionId: string;
    itemId: string;
    quantity: number;
    price: number;
  };
}

/**
 * Create a new POS transaction
 * 
 * @param locationId - The location ID for the transaction
 * @param location - The location slug
 * @returns Promise resolving to transaction data
 */
export async function createPOSTransaction(
  locationId: number,
  location: string
): Promise<CreateTransactionResponse> {
  const response = await fetch('/admin/v2/api/pos/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ locationId, location }),
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

/**
 * Add a line item to a transaction
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param itemData - Line item data (itemId, quantity, optional discount/overridePrice)
 * @returns Promise resolving to line item data
 */
export async function addLineItem(
  transactionId: string,
  location: string,
  itemData: {
    itemId: string;
    quantity: number;
    discount?: number;
    overridePrice?: number;
  }
): Promise<AddLineItemResponse> {
  const response = await fetch(`/admin/v2/api/pos/transaction/${transactionId}/line-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location, ...itemData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add line item');
  }

  return response.json();
}
