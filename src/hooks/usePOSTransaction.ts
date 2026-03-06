import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { createPOSTransaction, getTransaction } from '@/lib/api/pos.api';
import { getStoredTransactionId, setStoredTransactionId, clearStoredTransactionId } from '@/utils/pos-storage';

export function usePOSTransaction(locationId: number, location: string) {
  const [transactionId, setTransactionId] = useState('Loading...');
  const [numericTransactionId, setNumericTransactionId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  /**
   * Initialize or restore transaction
   * Returns line items array (empty for new transaction, populated for restored)
   */
  const initializeTransaction = async (): Promise<Array<{
    id: number;
    quantity: number;
    price: string;
    overridePrice?: string;
    item: {
      id: string;
      code: string;
      description: string;
      price: number;
    };
  }>> => {
    if (isInitializedRef.current) {
      console.log('[Transaction Init] Already initialized, skipping');
      return [];
    }
    isInitializedRef.current = true;

    // Step 1: Check for stored transaction ID
    const storedTransactionId = getStoredTransactionId(location);

    if (storedTransactionId) {
      console.log('[Transaction Init] Found stored transaction:', storedTransactionId);

      try {
        // Step 2: Validate stored transaction with API
        const existingTransaction = await getTransaction(storedTransactionId, location);

        // Step 3: Check if transaction is still active (DRAFT status)
        if (existingTransaction.data.status === 'DRAFT') {
          console.log('[Transaction Init] Restoring active transaction with', existingTransaction.data.lineItems.length, 'items');

          // Restore transaction state
          setTransactionId(existingTransaction.data.transactionId);
          setNumericTransactionId(existingTransaction.data.id.toString());
          const date = new Date(existingTransaction.data.createdAt);
          setTransactionDate(date.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: '2-digit' 
          }));
          setIsLoading(false);
          
          // Return line items for UI restoration
          return existingTransaction.data.lineItems;
        } else {
          // Transaction is completed (PAID/CANCELLED)
          console.log('[Transaction Init] Stored transaction is completed, creating new');
          clearStoredTransactionId(location);
        }
      } catch (error) {
        // API returned 404 or error - stored ID is invalid
        console.log('[Transaction Init] Stored transaction not found, creating new');
        clearStoredTransactionId(location);
      }
    }

    // Step 4: Create new transaction (no stored ID or validation failed)
    console.log('[Transaction Init] Creating new transaction');

    try {
      const result = await createPOSTransaction(locationId, location);
      
      console.log('[Transaction Init] Success:', {
        display: result.data.transactionId,
        numeric: result.data.numericTransactionId
      });

      setTransactionId(result.data.transactionId);
      setNumericTransactionId(result.data.numericTransactionId);
      const date = new Date(result.data.transactionDate);
      setTransactionDate(date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }));

      // Step 5: Store new transaction ID
      setStoredTransactionId(location, result.data.numericTransactionId);
      
      return []; // New transaction has no line items
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction. Please refresh.');
      isInitializedRef.current = false; // Allow retry on error
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const resetTransaction = () => {
    console.log('[Transaction Reset] Clearing transaction state');
    clearStoredTransactionId(location); // Clear from localStorage
    isInitializedRef.current = false;
    setTransactionId('Loading...');
    setNumericTransactionId('');
    setTransactionDate('');
    setIsLoading(true);
  };

  return {
    transactionId,
    numericTransactionId,
    transactionDate,
    isLoading,
    initializeTransaction,
    resetTransaction,
    clearStoredTransaction: () => clearStoredTransactionId(location),
  };
}