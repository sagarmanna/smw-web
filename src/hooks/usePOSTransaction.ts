import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { createPOSTransaction } from '@/lib/api/pos.api';

/**
 * Custom hook for POS transaction management
 * Handles all POS-related API calls and state
 */
export function usePOSTransaction(locationId: number, location: string) {
  const [transactionId, setTransactionId] = useState('Loading...');
  const [numericTransactionId, setNumericTransactionId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  const initializeTransaction = async () => {
    if (isInitializedRef.current) {
      console.log('[Transaction Init] Already initialized, skipping');
      return;
    }

    console.log('[Transaction Init] Creating new transaction');
    isInitializedRef.current = true;

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
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction. Using fallback values.');
      
      // Set fallback values
      const fallbackId = Date.now();
      setTransactionId('P-001-1024');
      setNumericTransactionId(fallbackId.toString());
      setTransactionDate(new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactionId,
    numericTransactionId,
    transactionDate,
    isLoading,
    initializeTransaction,
  };
}
