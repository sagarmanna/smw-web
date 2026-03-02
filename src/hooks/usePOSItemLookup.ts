import { useState } from 'react';
import { toast } from 'sonner';
import { lookupItem } from '@/lib/api/pos.api';

/**
 * Custom hook for POS item lookup
 * Handles item scanning and API calls
 */
export function usePOSItemLookup(location: string) {
  const [isScanning, setIsScanning] = useState(false);

  const scanItem = async (code: string) => {
    if (!code.trim()) return null;

    setIsScanning(true);
    try {
      const result = await lookupItem(location, code.trim());
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to lookup item';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanItem,
  };
}
