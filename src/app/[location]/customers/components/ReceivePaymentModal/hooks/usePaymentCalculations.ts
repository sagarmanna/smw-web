// hooks/usePaymentCalculations.ts
import { useMemo } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, PaymentCalculations } from '../types';

/**
 * Custom hook for calculating payment totals with correct formulas
 * Following Single Responsibility Principle - handles only calculation logic
 * Memoized for performance optimization
 * 
 * Business Logic:
 * 1. Cash payment is applied first to invoices
 * 2. Credits are only used if cash is insufficient
 * 3. Amount To Credit = Cash overpayment AFTER using credits (if needed)
 * 
 * Formulas Applied:
 * - Amount To Apply = Σ(selected invoice balances)
 * - Cash Applied = min(cash, amount to apply)
 * - Credits Actually Used = min(selected credits, remaining after cash)
 * - Amount To Credit = Cash overpayment (if any)
 * - Amount Needed = TotalOutstanding (static display)
 */
export const usePaymentCalculations = (
  lessons: LessonItem[],
  groupLessons: GroupLessonItem[],
  invoices: InvoiceItem[],
  credits: CreditItem[],
  amountReceived: string,
  totalOutstanding: number
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

    // Calculate selected credits (maximum credits user wants to use)
    const selectedCreditsAmount = credits
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

    // Sum of all selected balances (lessons + group lessons + invoices)
    const totalSelectedBalances = lessonsBalance + groupLessonsBalance + invoicesBalance;

    // Parse amount received from input
    const receivedAmount = parseMoneyValue(amountReceived);

    // Amount To Apply = Σ(selected invoice balances)
    const amountToApply = totalSelectedBalances;

    // Business Logic: Cash is applied first, then credits if needed
    // We don't need to track these values separately for the return calculation

    // Calculate overpayment (only from cash)
    // If cash exceeds amount to apply, the excess becomes new credit
    const amountToCredit = Math.max(0, receivedAmount - amountToApply);

    // Payment Received = Amount entered by user (from input field)
    const paymentReceived = receivedAmount;

    // Suggested Amount Received = Amount To Apply - Selected Credits
    // This is what should be displayed/auto-filled in the Amount Received input
    const suggestedAmountReceived = Math.max(0, amountToApply - selectedCreditsAmount);

    // Amount Needed = TotalOutstanding (static display of total owed)
    const amountNeeded = totalOutstanding;

    // Calculate payment totals for each category
    const lessonPayments = lessonsBalance;
    const groupLessonPayments = groupLessonsBalance;
    const invoicePayments = invoicesBalance;

    return {
      availableCredits,
      selectedCredits: selectedCreditsAmount, // Credits user selected (checked), not necessarily used
      amountToApply,
      amountToCredit,
      paymentReceived,
      suggestedAmountReceived, // NEW: Calculated amount that should show in input
      amountNeeded,
      lessonPayments,
      groupLessonPayments,
      invoicePayments,
    };
  }, [lessons, groupLessons, invoices, credits, amountReceived, totalOutstanding]);
};