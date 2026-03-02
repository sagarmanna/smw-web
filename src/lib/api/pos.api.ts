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
  const response = await fetch('/api/pos/transaction', {
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
