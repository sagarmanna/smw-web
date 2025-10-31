// hooks/usePaymentData.ts
import { useState, useCallback, useEffect } from 'react';
import { LessonItem, InvoiceItem, GroupLessonItem, CreditItem } from '../types';
import { 
  getReceivePaymentLessons,
  getReceivePaymentGroupLessons,
  getReceivePaymentInvoices,
  getPaymentCredits,
  getInvoiceCredits,
  getPaymentMethods, 
  getCustomerView,
  PaymentMethod 
} from '../api/receive-payment.api';

interface UsePaymentDataResult {
  lessons: LessonItem[];
  groupLessons: GroupLessonItem[];
  invoices: InvoiceItem[];
  credits: CreditItem[];
  paymentMethods: Array<{ value: string; label: string }>;
  customerName: string;
  customerId: number;
  totalOutstanding: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch all payment-related data from APIs
 * Loads all data at once without pagination
 * @param location - The location identifier
 * @param customerId - The customer ID
 */
export const usePaymentData = (
  location: string,
  customerId: number
): UsePaymentDataResult => {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely parse monetary values
  const parseMoneyValue = useCallback((value: string | number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load customer data and payment methods
      const [methodsData, customerData] = await Promise.all([
        getPaymentMethods(),
        getCustomerView(location, customerId)
      ]);

      // Transform payment methods data
      const transformedMethods = methodsData.map((method: PaymentMethod) => ({
        value: method.id.toString(),
        label: method.name
      }));
      setPaymentMethods(transformedMethods);

      // Set customer data
      if (customerData) {
        setCustomerName(customerData.fullName);
        setCustomerIdState(customerData.id);
      }

      // Load all lessons (using large limit to get all records)
      const lessonsResult = await getReceivePaymentLessons(location, customerId, 1, 99999);
      const transformedLessons: LessonItem[] = lessonsResult.data.map(lesson => {
        const balance = parseMoneyValue(lesson.balance);
        return {
          id: lesson.id.toString(),
          selected: true,
          date: lesson.date,
          dueDate: lesson.dueDate,
          student: lesson.studentName,
          program: lesson.programName,
          teacher: lesson.teacherName,
          amount: parseMoneyValue(lesson.total),
          balance: balance,
          payment: balance.toFixed(2),
        };
      });
      setLessons(transformedLessons);

      // Load all group lessons
      const groupLessonsResult = await getReceivePaymentGroupLessons(location, customerId, 1, 99999);
      const transformedGroupLessons: GroupLessonItem[] = groupLessonsResult.data.map(groupLesson => {
        const balance = parseMoneyValue(groupLesson.balance);
        return {
          id: groupLesson.id.toString(),
          selected: true,
          date: groupLesson.date,
          dueDate: groupLesson.dueDate,
          student: groupLesson.studentName,
          program: groupLesson.programName,
          teacher: groupLesson.teacherName,
          amount: parseMoneyValue(groupLesson.total),
          balance: balance,
          payment: balance.toFixed(2),
        };
      });
      setGroupLessons(transformedGroupLessons);

      // Load all invoices
      const invoicesResult = await getReceivePaymentInvoices(location, customerId, 1, 99999);
      const transformedInvoices: InvoiceItem[] = invoicesResult.data.map(invoice => {
        const total = parseMoneyValue(invoice.total);
        const payments = parseMoneyValue(invoice.payments);
        const balance = parseMoneyValue(invoice.balance);

        return {
          id: invoice.id,
          selected: true,
          date: invoice.date,
          number: invoice.id,
          status: invoice.status,
          amount: total,
          payments: payments,
          balance: balance,
          payment: balance.toFixed(2),
        };
      });
      setInvoices(transformedInvoices);

      // Load all credits
      const [paymentCreditsResult, invoiceCreditsResult] = await Promise.all([
        getPaymentCredits(location, customerId, 1, 99999),
        getInvoiceCredits(location, customerId, 1, 99999)
      ]);

      const allCredits = [
        ...paymentCreditsResult.data,
        ...invoiceCreditsResult.data
      ];

      const transformedCredits: CreditItem[] = allCredits.map(credit => {
        const amount = parseMoneyValue(credit.amount);
        return {
          id: credit.id.toString(),
          selected: true,
          type: credit.type,
          reference: credit.reference,
          amount: amount,
          payment: amount.toFixed(2),
        };
      });
      setCredits(transformedCredits);

      // Calculate total outstanding balance
      const lessonsTotal = transformedLessons.reduce((sum, l) => sum + l.balance, 0);
      const groupLessonsTotal = transformedGroupLessons.reduce((sum, gl) => sum + gl.balance, 0);
      const invoicesTotal = transformedInvoices.reduce((sum, inv) => sum + inv.balance, 0);
      
      // Total Outstanding = Sum of all balances (lessons + group lessons + invoices)
      // Credits are NOT subtracted here - they are applied during payment
      setTotalOutstanding(lessonsTotal + groupLessonsTotal + invoicesTotal);

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [location, customerId, parseMoneyValue]);

  // Load all data on mount
  useEffect(() => {
    if (location && customerId) {
      loadAllData();
    }
  }, [location, customerId, loadAllData]);

  return {
    lessons,
    groupLessons,
    invoices,
    credits,
    paymentMethods,
    customerName,
    customerId: customerIdState,
    totalOutstanding,
    isLoading,
    error,
  };
};