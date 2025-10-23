// hooks/useItemHandlers.ts
import { useCallback } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem } from '../types';

/**
 * Custom hook for handling item selection and payment changes
 * Following Single Responsibility Principle - handles only item manipulation logic
 */
export const useItemHandlers = (
  setLessons: React.Dispatch<React.SetStateAction<LessonItem[]>>,
  setGroupLessons: React.Dispatch<React.SetStateAction<GroupLessonItem[]>>,
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceItem[]>>,
  setCredits: React.Dispatch<React.SetStateAction<CreditItem[]>>
) => {
  // Lesson handlers
  const toggleLesson = useCallback(
    (id: string) => {
      setLessons(prev =>
        prev.map(item =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    },
    [setLessons]
  );

  const toggleAllLessons = useCallback(
    (checked: boolean) => {
      setLessons(prev => prev.map(item => ({ ...item, selected: checked })));
    },
    [setLessons]
  );

  const handleLessonPaymentChange = useCallback(
    (id: string, value: string) => {
      setLessons(prev =>
        prev.map(item => (item.id === id ? { ...item, payment: value } : item))
      );
    },
    [setLessons]
  );

  // Group Lesson handlers
  const toggleGroupLesson = useCallback(
    (id: string) => {
      setGroupLessons(prev =>
        prev.map(item =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    },
    [setGroupLessons]
  );

  const toggleAllGroupLessons = useCallback(
    (checked: boolean) => {
      setGroupLessons(prev => prev.map(item => ({ ...item, selected: checked })));
    },
    [setGroupLessons]
  );

  const handleGroupLessonPaymentChange = useCallback(
    (id: string, value: string) => {
      setGroupLessons(prev =>
        prev.map(item => (item.id === id ? { ...item, payment: value } : item))
      );
    },
    [setGroupLessons]
  );

  // Invoice handlers
  const toggleInvoice = useCallback(
    (id: string) => {
      setInvoices(prev =>
        prev.map(item =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    },
    [setInvoices]
  );

  const toggleAllInvoices = useCallback(
    (checked: boolean) => {
      setInvoices(prev => prev.map(item => ({ ...item, selected: checked })));
    },
    [setInvoices]
  );

  const handleInvoicePaymentChange = useCallback(
    (id: string, value: string) => {
      setInvoices(prev =>
        prev.map(item => (item.id === id ? { ...item, payment: value } : item))
      );
    },
    [setInvoices]
  );

  // Credit handlers
  const toggleCredit = useCallback(
    (id: string) => {
      setCredits(prev =>
        prev.map(item =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    },
    [setCredits]
  );

  const toggleAllCredits = useCallback(
    (checked: boolean) => {
      setCredits(prev => prev.map(item => ({ ...item, selected: checked })));
    },
    [setCredits]
  );

  const handleCreditPaymentChange = useCallback(
    (id: string, value: string) => {
      setCredits(prev =>
        prev.map(item => (item.id === id ? { ...item, payment: value } : item))
      );
    },
    [setCredits]
  );

  return {
    // Lesson handlers
    toggleLesson,
    toggleAllLessons,
    handleLessonPaymentChange,
    
    // Group Lesson handlers
    toggleGroupLesson,
    toggleAllGroupLessons,
    handleGroupLessonPaymentChange,
    
    // Invoice handlers
    toggleInvoice,
    toggleAllInvoices,
    handleInvoicePaymentChange,
    
    // Credit handlers
    toggleCredit,
    toggleAllCredits,
    handleCreditPaymentChange,
  };
};