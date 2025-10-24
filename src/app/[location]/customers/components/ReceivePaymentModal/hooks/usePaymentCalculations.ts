// hooks/usePaymentCalculations.ts
import { useMemo } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, PaymentCalculations } from '../types';
import { PaymentCalculator } from '../utils';

/**
 * Custom hook for calculating payment totals
 * Following Single Responsibility Principle - handles only calculation logic
 * Memoized for performance optimization
 */
export const usePaymentCalculations = (
  lessons: LessonItem[],
  groupLessons: GroupLessonItem[],
  invoices: InvoiceItem[],
  credits: CreditItem[],
  amountReceived: string
): PaymentCalculations => {
  return useMemo(
    () =>
      PaymentCalculator.calculateTotals(
        lessons,
        groupLessons,
        invoices,
        credits,
        amountReceived
      ),
    [lessons, groupLessons, invoices, credits, amountReceived]
  );
};