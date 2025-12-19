import { isAfter } from 'date-fns';
import { parseDateString } from '@/utils/dateUtils';

// Helper function to check if a lesson is active (not expired)
export const isLessonActive = (expiryDateStr: string): boolean => {
  const expiryDate = parseDateString(expiryDateStr);
  if (!expiryDate) return true; // If we can't parse, assume active
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  expiryDate.setHours(0, 0, 0, 0);
  
  return isAfter(expiryDate, today) || expiryDate.getTime() === today.getTime();
};

