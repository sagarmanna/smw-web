// hooks/usePaymentCalculations.ts
import { useMemo } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, PaymentCalculations } from '../types';

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
  return useMemo(() => {
    // Helper function to safely parse monetary values
    const parseMoneyValue = (value: string | number | undefined | null): number => {
      if (value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      const cleaned = String(value).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Calculate total available credits (all credits regardless of selection)
    const availableCredits = credits.reduce((sum, credit) => {
      return sum + parseMoneyValue(credit.amount);
    }, 0);

    // Calculate selected credits (only selected credits)
    const selectedCredits = credits
      .filter(credit => credit.selected)
      .reduce((sum, credit) => {
        return sum + parseMoneyValue(credit.payment);
      }, 0);

    // Calculate total balance from selected lessons
    const lessonsBalance = lessons
      .filter(lesson => lesson.selected)
      .reduce((sum, lesson) => {
        return sum + parseMoneyValue(lesson.payment);
      }, 0);

    // Calculate total balance from selected group lessons
    const groupLessonsBalance = groupLessons
      .filter(groupLesson => groupLesson.selected)
      .reduce((sum, groupLesson) => {
        return sum + parseMoneyValue(groupLesson.payment);
      }, 0);

    // Calculate total balance from selected invoices
    const invoicesBalance = invoices
      .filter(invoice => invoice.selected)
      .reduce((sum, invoice) => {
        return sum + parseMoneyValue(invoice.payment);
      }, 0);

    // Amount To Apply = Total balance of all selected items
    const amountToApply = lessonsBalance + groupLessonsBalance + invoicesBalance;

    // Parse amount received
    const receivedAmount = parseMoneyValue(amountReceived);

    // Amount To Credit = (Amount Received + Selected Credits) - Amount To Apply
    // If negative, it means there's a shortfall
    // If positive, it means there's excess that will become a credit
    const amountToCredit = (receivedAmount + selectedCredits) - amountToApply;

    // Calculate payment totals for each category (same as the balances calculated above)
    const lessonPayments = lessonsBalance;
    const groupLessonPayments = groupLessonsBalance;
    const invoicePayments = invoicesBalance;

    return {
      availableCredits,
      selectedCredits,
      amountToApply,
      amountToCredit,
      lessonPayments,
      groupLessonPayments,
      invoicePayments,
    };
  }, [lessons, groupLessons, invoices, credits, amountReceived]);
};