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
  getCustomersList,
  PaymentMethod,
  Customer
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
  customersList: Array<{ value: string; label: string; id: number }>;
  isLoadingCustomers: boolean;
  reloadPaymentData: (newCustomerId: number) => Promise<void>;
  reloadLessonsByDateRange: (targetCustomerId: number, startDate: Date, endDate: Date) => Promise<void>;
  reloadGroupLessonsByDateRange: (targetCustomerId: number, startDate: Date, endDate: Date) => Promise<void>;
}

/**
 * Custom hook to fetch all payment-related data from APIs
 * Loads all data at once without pagination
 */
export const usePaymentData = (
  location: string,
  customerId: number,
  shouldLoad: boolean = true,
  isCustomerRoute: boolean = true
): UsePaymentDataResult => {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ value: string; label: string }>>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customersList, setCustomersList] = useState<Array<{ value: string; label: string; id: number }>>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Helper function to safely parse monetary values
  const parseMoneyValue = useCallback((value: string | number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  // Calculate total outstanding dynamically
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
    
    const total = lessonsTotal + groupLessonsTotal + invoicesTotal - selectedCreditsTotal;
    
    return total;
  }, [lessons, groupLessons, invoices, credits, parseMoneyValue]);

  // Load customers list for dropdown
  const loadCustomersList = useCallback(async (currentCustomerId?: number, currentCustomerName?: string) => {
    if (isCustomerRoute) return;
    
    setIsLoadingCustomers(true);
    try {
      const result = await getCustomersList(location, 1, 1000, true, false, 'asc');
      
      const transformedCustomers = result.data.map((customer: Customer) => ({
        value: customer.id.toString(),
        label: `${customer.firstName} ${customer.lastName}`,
        id: customer.id
      }));
      
      // If current customer is provided but not in the list, add it
      if (currentCustomerId && currentCustomerName) {
        const customerExists = transformedCustomers.some(c => c.id === currentCustomerId);
        if (!customerExists) {
          transformedCustomers.unshift({
            value: currentCustomerId.toString(),
            label: currentCustomerName,
            id: currentCustomerId
          });
        }
      }
      
      setCustomersList(transformedCustomers);
    } catch (err) {
      console.error('Error fetching customers list:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [location, isCustomerRoute]);

  // Load only lessons for a specific customer (optionally filtered by due date range)
  const loadLessons = useCallback(
    async (targetCustomerId: number, startDate?: Date, endDate?: Date) => {
      if (!targetCustomerId || targetCustomerId === 0) {
        setLessons([]);
        return;
      }

      const lessonsResult = await getReceivePaymentLessons(
        location,
        targetCustomerId,
        1,
        99999,
        startDate,
        endDate
      );

      const transformedLessons: LessonItem[] = lessonsResult.data.map((lesson) => {
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
    },
    [location, parseMoneyValue]
  );

  // Load full payment data (lessons + other tables) for a specific customer
  const loadPaymentData = useCallback(async (targetCustomerId: number) => {
    if (!targetCustomerId || targetCustomerId === 0) {
      // Clear data if no customer selected
      setLessons([]);
      setGroupLessons([]);
      setInvoices([]);
      setCredits([]);
      return;
    }
    
    try {
      // Load lessons using default behaviour (no explicit date range here)
      await loadLessons(targetCustomerId);

      // Load all group lessons (default behaviour - no explicit date range here)
      const groupLessonsResult = await getReceivePaymentGroupLessons(location, targetCustomerId, 1, 99999);
      const transformedGroupLessons: GroupLessonItem[] = groupLessonsResult.data.map((groupLesson) => {
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
      const invoicesResult = await getReceivePaymentInvoices(location, targetCustomerId, 1, 99999);
      const transformedInvoices: InvoiceItem[] = invoicesResult.data.map(invoice => {
        const total = parseMoneyValue(invoice.total);
        const payments = parseMoneyValue(invoice.payments);
        const balance = parseMoneyValue(invoice.balance);

        return {
          id: invoice.id.toString(),
          selected: true,
          date: invoice.date,
          number: invoice.number,
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
        getPaymentCredits(location, targetCustomerId, 1, 99999),
        getInvoiceCredits(location, targetCustomerId, 1, 99999)
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
      throw err;
    }
  }, [location, parseMoneyValue, loadLessons]);

  // Reload payment data when customer changes
  const reloadPaymentData = useCallback(async (newCustomerId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setCustomerIdState(newCustomerId);
      
      // Always load customer name when customer changes (needed for dropdown display)
      // Global component always uses dropdown mode, so we need customer name
      if (newCustomerId > 0) {
        const customerData = await getCustomerView(location, newCustomerId);
        if (customerData) {
          setCustomerName(customerData.fullName);
        }
      }
      
      // Load payment data (no date range filter here to preserve existing behaviour)
      await loadPaymentData(newCustomerId);
      
    } catch (err) {
      console.error('Error reloading payment data:', err);
      setError('Failed to load payment data for selected customer');
    } finally {
      setIsLoading(false);
    }
  }, [location, loadPaymentData]);

  // Reload only lessons by a specific date range for a given customer.
  // Other entities (group lessons, invoices, credits) are NOT reloaded.
  const reloadLessonsByDateRange = useCallback(
    async (targetCustomerId: number, startDate: Date, endDate: Date) => {
      setIsLoading(true);
      setError(null);

      try {
        await loadLessons(targetCustomerId, startDate, endDate);
      } catch (err) {
        console.error('Error reloading lessons by date range:', err);
        setError('Failed to load lessons for selected date range');
      } finally {
        setIsLoading(false);
      }
    },
    [loadLessons]
  );

  // Reload only group lessons by a specific date range for a given customer.
  // Other entities (lessons, invoices, credits) are NOT reloaded.
  const reloadGroupLessonsByDateRange = useCallback(
    async (targetCustomerId: number, startDate: Date, endDate: Date) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getReceivePaymentGroupLessons(location, targetCustomerId, 1, 99999, startDate, endDate);
        const transformedGroupLessons: GroupLessonItem[] = result.data.map((groupLesson) => {
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
      } catch (err) {
        console.error('Error reloading group lessons by date range:', err);
        setError('Failed to load group lessons for selected date range');
      } finally {
        setIsLoading(false);
      }
    },
    [location, parseMoneyValue]
  );

  // Load all data on mount
  const loadAllData = useCallback(async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Always load payment methods
      const methodsData = await getPaymentMethods(location);
      const transformedMethods = methodsData.map((method: PaymentMethod) => ({
        value: method.id.toString(),
        label: method.name
      }));
      setPaymentMethods(transformedMethods);

      // Load customer-specific data if customerId is provided
      let currentCustomerName = customerName || '';
      if (customerId && customerId !== 0) {
        // Load customer data to get name (needed for dropdown display)
        const customerData = await getCustomerView(location, customerId);
        if (customerData) {
          currentCustomerName = customerData.fullName;
          setCustomerName(customerData.fullName);
          setCustomerIdState(customerData.id);
        }

        // Load payment data
        await loadPaymentData(customerId);
      }

      // Load customers list if NOT in customer route (after loading current customer name)
      if (!isCustomerRoute) {
        await loadCustomersList(customerId, currentCustomerName);
      }

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [location, customerId, isCustomerRoute, loadCustomersList, loadPaymentData]);

  // Load all data only when shouldLoad is true
  useEffect(() => {
    if (shouldLoad && location) {
      loadAllData();
    } else if (!shouldLoad) {
      // Reset data when modal closes
      setLessons([]);
      setGroupLessons([]);
      setInvoices([]);
      setCredits([]);
      setPaymentMethods([]);
      setCustomerName('');
      setCustomersList([]);
      setIsLoading(false);
      setError(null);
    }
  }, [shouldLoad, location, loadAllData]);

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
    setLessons,
    setGroupLessons,
    setInvoices,
    setCredits,
    customersList,
    isLoadingCustomers,
    reloadPaymentData,
    reloadLessonsByDateRange,
    reloadGroupLessonsByDateRange,
  };
};
