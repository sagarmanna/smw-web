/// hooks/usePaymentColumns.ts
import { useMemo } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem } from '../types';
import {
  createLessonColumns,
  createGroupLessonColumns,
  createInvoiceColumns,
  createCreditColumns,
} from '../columns/columnDefinitions';

/**
 * Custom hook for managing table column definitions
 * Following Single Responsibility Principle - handles only column configuration
 * Memoized for performance optimization
 */
export const usePaymentColumns = (
  lessons: LessonItem[],
  groupLessons: GroupLessonItem[],
  invoices: InvoiceItem[],
  credits: CreditItem[],
  handlers: {
    toggleAllLessons: (checked: boolean) => void;
    toggleLesson: (id: string) => void;
    handleLessonPaymentChange: (id: string, value: string) => void;
    toggleAllGroupLessons: (checked: boolean) => void;
    toggleGroupLesson: (id: string) => void;
    handleGroupLessonPaymentChange: (id: string, value: string) => void;
    toggleAllInvoices: (checked: boolean) => void;
    toggleInvoice: (id: string) => void;
    handleInvoicePaymentChange: (id: string, value: string) => void;
    toggleAllCredits: (checked: boolean) => void;
    toggleCredit: (id: string) => void;
    handleCreditPaymentChange: (id: string, value: string) => void;
  }
) => {
  const lessonColumns = useMemo(
    () =>
      createLessonColumns(
        lessons,
        handlers.toggleAllLessons,
        handlers.toggleLesson,
        handlers.handleLessonPaymentChange
      ),
    [
      lessons,
      handlers.toggleAllLessons,
      handlers.toggleLesson,
      handlers.handleLessonPaymentChange,
    ]
  );

  const groupLessonColumns = useMemo(
    () =>
      createGroupLessonColumns(
        groupLessons,
        handlers.toggleAllGroupLessons,
        handlers.toggleGroupLesson,
        handlers.handleGroupLessonPaymentChange
      ),
    [
      groupLessons,
      handlers.toggleAllGroupLessons,
      handlers.toggleGroupLesson,
      handlers.handleGroupLessonPaymentChange,
    ]
  );

  const invoiceColumns = useMemo(
    () =>
      createInvoiceColumns(
        invoices,
        handlers.toggleAllInvoices,
        handlers.toggleInvoice,
        handlers.handleInvoicePaymentChange
      ),
    [
      invoices,
      handlers.toggleAllInvoices,
      handlers.toggleInvoice,
      handlers.handleInvoicePaymentChange,
    ]
  );

  const creditColumns = useMemo(
    () =>
      createCreditColumns(
        credits,
        handlers.toggleAllCredits,
        handlers.toggleCredit,
        handlers.handleCreditPaymentChange
      ),
    [
      credits,
      handlers.toggleAllCredits,
      handlers.toggleCredit,
      handlers.handleCreditPaymentChange,
    ]
  );

  return {
    lessonColumns,
    groupLessonColumns,
    invoiceColumns,
    creditColumns,
  };
};