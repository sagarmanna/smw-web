import { useState } from 'react';
import { toast } from 'sonner';
import { createPOSTransaction } from '@/lib/api/pos.api';

/**
 * Custom hook for POS transaction management
 * Handles all POS-related API calls and state
 */
export function usePOSTransaction(locationId: number) {
  const [transactionId, setTransactionId] = useState('Loading...');
  const [transactionDate, setTransactionDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const initializeTransaction = async () => {
    try {
      const result = await createPOSTransaction(locationId);
      
      setTransactionId(result.data.transactionId);
      const date = new Date(result.data.transactionDate);
      setTransactionDate(date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }));
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error('Failed to create transaction. Using fallback values.');
      setTransactionId('P-001-1024');
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
    transactionDate,
    isLoading,
    initializeTransaction,
  };
}
