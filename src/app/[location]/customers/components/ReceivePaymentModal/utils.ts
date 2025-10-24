// utils.ts
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, PaymentCalculations } from './types';

/**
 * Calculator utility for payment-related calculations
 * Following Single Responsibility Principle
 */
export class PaymentCalculator {
  static calculateTotals(
    lessons: LessonItem[],
    groupLessons: GroupLessonItem[],
    invoices: InvoiceItem[],
    credits: CreditItem[],
    amountReceived: string
  ): PaymentCalculations {
    const availableCredits = credits.reduce((sum, c) => sum + c.amount, 0);
    
    const selectedCredits = credits
      .filter(c => c.selected)
      .reduce((sum, c) => sum + (parseFloat(c.payment) || 0), 0);
    
    const lessonPayments = lessons
      .filter(l => l.selected)
      .reduce((sum, l) => sum + (parseFloat(l.payment) || 0), 0);
    
    const groupLessonPayments = groupLessons
      .filter(gl => gl.selected)
      .reduce((sum, gl) => sum + (parseFloat(gl.payment) || 0), 0);
    
    const invoicePayments = invoices
      .filter(i => i.selected)
      .reduce((sum, i) => sum + (parseFloat(i.payment) || 0), 0);
    
    const amountToApply = lessonPayments + groupLessonPayments + invoicePayments;
    const amountToCredit = (parseFloat(amountReceived) || 0) - amountToApply;

    return {
      availableCredits,
      selectedCredits,
      lessonPayments,
      groupLessonPayments,
      invoicePayments,
      amountToApply,
      amountToCredit,
    };
  }

  static parsePaymentAmount(value: string): number {
    return parseFloat(value) || 0;
  }
}

/**
 * Date utility functions
 * Following Single Responsibility Principle
 */
export class DateUtils {
  static getTodayAtMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  static isBeforeToday(date: Date): boolean {
    const today = DateUtils.getTodayAtMidnight();
    return date < today;
  }
}

/**
 * Data mapping utilities
 * Following Single Responsibility Principle
 */
export class DataMapper {
  static extractSelectedIds<T extends { id: string; selected: boolean }>(
    items: T[]
  ): string[] {
    return items.filter(item => item.selected).map(item => item.id);
  }

  static createPaymentMap<T extends { id: string; payment: string }>(
    items: T[]
  ): Record<string, number> {
    return Object.fromEntries(
      items.map(item => [item.id, PaymentCalculator.parsePaymentAmount(item.payment)])
    );
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  static isValidAmount(value: string): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }

  static isRequiredFieldFilled(value: string): boolean {
    return value.trim().length > 0;
  }
}