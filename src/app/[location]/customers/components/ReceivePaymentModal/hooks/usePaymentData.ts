// hooks/usePaymentData.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
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
  setLessons: React.Dispatch<React.SetStateAction<LessonItem[]>>;
  setGroupLessons: React.Dispatch<React.SetStateAction<GroupLessonItem[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
  setCredits: React.Dispatch<React.SetStateAction<CreditItem[]>>;
}

/**
 * Custom hook to fetch all payment-related data from APIs
 * Loads all data at once without pagination
 * Calculates totalOutstanding dynamically based on selected items minus selected credits
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param shouldLoad - Whether to load data (only when modal is open)
 */
export const usePaymentData = (
  location: string,
  customerId: number,
  shouldLoad: boolean = true
): UsePaymentDataResult => {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
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

  // Calculate total outstanding dynamically based on SELECTED items MINUS selected credits
  // Formula: Amount Needed = sum of all selected (lessons, group lesson and invoice) - sum of all selected credits
  const totalOutstanding = useMemo(() => {
    const lessonsTotal = lessons
      .filter(l => l.selected)
      .reduce((sum, l) => sum + l.balance, 0);
    
    const groupLessonsTotal = groupLessons
      .filter(gl => gl.selected)
      .reduce((sum, gl) => sum + gl.balance, 0);
    
    const invoicesTotal = invoices
      .filter(inv => inv.selected)
      .reduce((sum, inv) => sum + inv.balance, 0);
    
    const selectedCreditsTotal = credits
      .filter(c => c.selected)
      .reduce((sum, c) => sum + parseMoneyValue(c.payment), 0);
    
    // Amount Needed = sum of selected items - sum of selected credits
    const total = lessonsTotal + groupLessonsTotal + invoicesTotal - selectedCreditsTotal;
  
    
    return total;
  }, [lessons, groupLessons, invoices, credits, parseMoneyValue]);

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

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [location, customerId, parseMoneyValue]);

  // Load all data only when shouldLoad is true (modal is open) and location/customerId are available
  useEffect(() => {
    if (shouldLoad && location && customerId) {
      loadAllData();
    } else if (!shouldLoad) {
      // Reset data when modal closes to avoid stale data
      setLessons([]);
      setGroupLessons([]);
      setInvoices([]);
      setCredits([]);
      setPaymentMethods([]);
      setCustomerName('');
      setIsLoading(false);
      setError(null);
    }
  }, [shouldLoad, location, customerId, loadAllData]);

  return {
    lessons,
    groupLessons,
    invoices,
    credits,
    paymentMethods,
    customerName,
    customerId: customerIdState,
    totalOutstanding: totalOutstanding,
    isLoading,
    error,
    setLessons,
    setGroupLessons,
    setInvoices,
    setCredits,
  };
};