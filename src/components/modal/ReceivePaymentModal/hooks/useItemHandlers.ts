// hooks/useItemHandlers.ts
import { useCallback } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem } from '../types';

/**
 * Custom hook for handling item selection and payment changes
 * Following Single Responsibility Principle - handles only item manipulation
 */
export const useItemHandlers = (
  setLessons: React.Dispatch<React.SetStateAction<LessonItem[]>>,
  setGroupLessons: React.Dispatch<React.SetStateAction<GroupLessonItem[]>>,
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceItem[]>>,
  setCredits: React.Dispatch<React.SetStateAction<CreditItem[]>>
) => {
  // ==================== LESSONS ====================
  const toggleLesson = useCallback(
    (id: string) => {
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === id
            ? { 
                ...lesson, 
                selected: !lesson.selected,
                // Clear payment when deselected, restore balance when selected
                payment: !lesson.selected ? lesson.balance.toFixed(2) : '0.00'
              }
            : lesson
        )
      );
    },
    [setLessons]
  );

  const toggleAllLessons = useCallback(
    (checked: boolean) => {
      setLessons((prev) =>
        prev.map((lesson) => ({ 
          ...lesson, 
          selected: checked,
          // Clear payment when deselected, restore balance when selected
          payment: checked ? lesson.balance.toFixed(2) : '0.00'
        }))
      );
    },
    [setLessons]
  );

  const handleLessonPaymentChange = useCallback(
    (id: string, value: string) => {
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === id ? { ...lesson, payment: value } : lesson
        )
      );
    },
    [setLessons]
  );

  // ==================== GROUP LESSONS ====================
  const toggleGroupLesson = useCallback(
    (id: string) => {
      setGroupLessons((prev) =>
        prev.map((groupLesson) =>
          groupLesson.id === id
            ? { 
                ...groupLesson, 
                selected: !groupLesson.selected,
                // Clear payment when deselected, restore balance when selected
                payment: !groupLesson.selected ? groupLesson.balance.toFixed(2) : '0.00'
              }
            : groupLesson
        )
      );
    },
    [setGroupLessons]
  );

  const toggleAllGroupLessons = useCallback(
    (checked: boolean) => {
      setGroupLessons((prev) =>
        prev.map((groupLesson) => ({ 
          ...groupLesson, 
          selected: checked,
          // Clear payment when deselected, restore balance when selected
          payment: checked ? groupLesson.balance.toFixed(2) : '0.00'
        }))
      );
    },
    [setGroupLessons]
  );

  const handleGroupLessonPaymentChange = useCallback(
    (id: string, value: string) => {
      setGroupLessons((prev) =>
        prev.map((groupLesson) =>
          groupLesson.id === id ? { ...groupLesson, payment: value } : groupLesson
        )
      );
    },
    [setGroupLessons]
  );

  // ==================== INVOICES ====================
  const toggleInvoice = useCallback(
    (id: string) => {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === id
            ? { 
                ...invoice, 
                selected: !invoice.selected,
                // Clear payment when deselected, restore balance when selected
                payment: !invoice.selected ? invoice.balance.toFixed(2) : '0.00'
              }
            : invoice
        )
      );
    },
    [setInvoices]
  );

  const toggleAllInvoices = useCallback(
    (checked: boolean) => {
      setInvoices((prev) =>
        prev.map((invoice) => ({ 
          ...invoice, 
          selected: checked,
          // Clear payment when deselected, restore balance when selected
          payment: checked ? invoice.balance.toFixed(2) : '0.00'
        }))
      );
    },
    [setInvoices]
  );

  const handleInvoicePaymentChange = useCallback(
    (id: string, value: string) => {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === id ? { ...invoice, payment: value } : invoice
        )
      );
    },
    [setInvoices]
  );

  // ==================== CREDITS ====================
  const toggleCredit = useCallback(
    (id: string) => {
      setCredits((prev) =>
        prev.map((credit) =>
          credit.id === id
            ? { 
                ...credit, 
                selected: !credit.selected,
                // Clear payment when deselected, restore amount when selected
                payment: !credit.selected ? credit.amount.toFixed(2) : '0.00'
              }
            : credit
        )
      );
    },
    [setCredits]
  );

  const toggleAllCredits = useCallback(
    (checked: boolean) => {
      setCredits((prev) =>
        prev.map((credit) => ({ 
          ...credit, 
          selected: checked,
          // Clear payment when deselected, restore amount when selected
          payment: checked ? credit.amount.toFixed(2) : '0.00'
        }))
      );
    },
    [setCredits]
  );

  const handleCreditPaymentChange = useCallback(
    (id: string, value: string) => {
      setCredits((prev) =>
        prev.map((credit) =>
          credit.id === id ? { ...credit, payment: value } : credit
        )
      );
    },
    [setCredits]
  );

  return {
    // Lessons
    toggleLesson,
    toggleAllLessons,
    handleLessonPaymentChange,
    
    // Group Lessons
    toggleGroupLesson,
    toggleAllGroupLessons,
    handleGroupLessonPaymentChange,
    
    // Invoices
    toggleInvoice,
    toggleAllInvoices,
    handleInvoicePaymentChange,
    
    // Credits
    toggleCredit,
    toggleAllCredits,
    handleCreditPaymentChange,
  };
};
