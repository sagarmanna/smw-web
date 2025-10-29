// hooks/usePaymentData.ts
import { useState, useCallback, useEffect } from 'react';
import { LessonItem, InvoiceItem } from '../types';
import { 
  getReceivePaymentLessons,
  getReceivePaymentInvoices, 
  getPaymentMethods, 
  getCustomerView,
  PaymentMethod 
} from '../api/receivePayment.Api';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePaymentDataResult {
  lessons: LessonItem[];
  invoices: InvoiceItem[];
  paymentMethods: Array<{ value: string; label: string }>;
  customerName: string;
  customerId: number;
  isLoading: boolean;
  error: string | null;
  lessonsPagination: PaginationState;
  invoicesPagination: PaginationState;
  lessonsLoading: boolean;
  invoicesLoading: boolean;
  loadLessonsPage: (page: number, limit: number) => Promise<void>;
  loadInvoicesPage: (page: number, limit: number) => Promise<void>;
}

/**
 * Custom hook to fetch payment-related data from APIs with pagination support
 * @param location - The location identifier
 * @param customerId - The customer ID
 */
export const usePaymentData = (
  location: string,
  customerId: number
): UsePaymentDataResult => {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Separate loading states for lessons and invoices
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  
  // Pagination states
  const [lessonsPagination, setLessonsPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [invoicesPagination, setInvoicesPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Helper function to safely parse monetary values
  const parseMoneyValue = useCallback((value: string | number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  // Load lessons with pagination
  const loadLessonsPage = useCallback(async (page: number, limit: number) => {
    setLessonsLoading(true);
    try {
      const result = await getReceivePaymentLessons(
        location,
        customerId,
        page,
        limit === -1 ? 99999 : limit
      );

      const transformedLessons: LessonItem[] = result.data.map(lesson => {
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
      setLessonsPagination(result.pagination);
    } catch (err) {
      console.error('Error loading lessons page:', err);
      setError('Failed to load lessons');
    } finally {
      setLessonsLoading(false);
    }
  }, [location, customerId, parseMoneyValue]);

  // Load invoices with pagination
  const loadInvoicesPage = useCallback(async (page: number, limit: number) => {
    setInvoicesLoading(true);
    try {
      const result = await getReceivePaymentInvoices(
        location,
        customerId,
        page,
        limit === -1 ? 99999 : limit
      );

      const transformedInvoices: InvoiceItem[] = result.data.map(invoice => {
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
      setInvoicesPagination(result.pagination);
    } catch (err) {
      console.error('Error loading invoices page:', err);
      setError('Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  }, [location, customerId, parseMoneyValue]);

  // Initial data load
  const loadInitialData = useCallback(async () => {
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

      // Load first page of lessons and invoices
      await Promise.all([
        loadLessonsPage(1, 10),
        loadInvoicesPage(1, 10)
      ]);

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [location, customerId, loadLessonsPage, loadInvoicesPage]);

  // Load initial data on mount
  useEffect(() => {
    if (location && customerId) {
      loadInitialData();
    }
  }, [location, customerId, loadInitialData]);

  return {
    lessons,
    invoices,
    paymentMethods,
    customerName,
    customerId: customerIdState,
    isLoading,
    error,
    lessonsPagination,
    invoicesPagination,
    lessonsLoading,
    invoicesLoading,
    loadLessonsPage,
    loadInvoicesPage,
  };
};