// hooks/usePaymentCalculations.ts
import { useMemo } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, PaymentCalculations } from '../types';

/**
 * Custom hook for calculating payment totals with correct formulas
 * Following Single Responsibility Principle - handles only calculation logic
 * Memoized for performance optimization
 * 
 * Formulas Applied:
 * - Amount Needed = sum of all selected (lessons, group lesson and invoice) - sum of all selected credits
 * - Amount Received = Amount entered by user (from input field)
 * - Available Credits = Total credits (all credits regardless of selection)
 * - Selected Credits = sum of all selected credits
 * - Amount To Apply = sum of all selected (lessons, group lesson and invoice)
 * - Amount To Credit = (Amount Received + Selected Credits) - Amount To Apply
 * - Suggested Amount Received = Amount To Apply - Selected Credits
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

    // Available Credits: Total credits (all credits regardless of selection)
    const availableCredits = credits.reduce((sum, credit) => {
      return sum + parseMoneyValue(credit.amount);
    }, 0);

    // Selected Credits: sum of all selected credits
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

    // Amount To Apply: sum of all selected (lessons, group lesson and invoice)
    const totalSelectedBalances = lessonsBalance + groupLessonsBalance + invoicesBalance;

    // Amount Received: Amount entered by user (from input field)
    const receivedAmount = parseMoneyValue(amountReceived);

    // Amount To Apply = Σ(selected invoice balances)
    const amountToApply = totalSelectedBalances;

    // Amount To Credit: (Amount Received + Selected Credits) - Amount To Apply
    // This can be negative (underpayment) or positive (overpayment)
    const amountToCredit = (receivedAmount + selectedCreditsAmount) - amountToApply;

    // Payment Received = Amount entered by user (from input field)
    const paymentReceived = receivedAmount;

    // Suggested Amount Received = Amount To Apply - Selected Credits
    // This is what should be displayed/auto-filled in the Amount Received input
    const suggestedAmountReceived = Math.max(0, amountToApply - selectedCreditsAmount);

    // Amount Needed = TotalOutstanding (sum of selected items - selected credits)
    const amountNeeded = totalSelectedBalances;

    // Calculate payment totals for each category
    const lessonPayments = lessonsBalance;
    const groupLessonPayments = groupLessonsBalance;
    const invoicePayments = invoicesBalance;

    return {
      availableCredits,
      selectedCredits: selectedCreditsAmount,
      amountToApply,
      amountToCredit,
      paymentReceived,
      suggestedAmountReceived,
      amountNeeded,
      lessonPayments,
      groupLessonPayments,
      invoicePayments,
    };
  }, [lessons, groupLessons, invoices, credits, amountReceived, totalOutstanding]);
};
