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
  // NEW: Customer dropdown data
  customersList: Array<{ value: string; label: string; id: number }>;
  isLoadingCustomers: boolean;
  // NEW: Function to reload payment data when customer changes
  reloadPaymentData: (newCustomerId: number) => Promise<void>;
}

/**
 * Custom hook to fetch all payment-related data from APIs
 * Loads all data at once without pagination
 * Calculates totalOutstanding dynamically based on selected items minus selected credits
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param shouldLoad - Whether to load data (only when modal is open)
 * @param isCustomerRoute - Whether we're in a customer-specific route
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: Customer dropdown state
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

  // NEW: Load customers list for dropdown (only when NOT in customer route)
  const loadCustomersList = useCallback(async () => {
    if (isCustomerRoute) return; // Skip if we're in customer-specific route
    
    setIsLoadingCustomers(true);
    try {
      const result = await getCustomersList(location, 1, 1000, true, false, 'asc');
      
      const transformedCustomers = result.data.map((customer: Customer) => ({
        value: customer.id.toString(),
        label: `${customer.firstName} ${customer.lastName}`,
        id: customer.id
      }));
      
      setCustomersList(transformedCustomers);
    } catch (err) {
      console.error('Error fetching customers list:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [location, isCustomerRoute]);

  // Load payment data for a specific customer
  const loadPaymentData = useCallback(async (targetCustomerId: number) => {
    if (!targetCustomerId || targetCustomerId === 0) return;
    
    try {
      // Load all lessons (using large limit to get all records)
      const lessonsResult = await getReceivePaymentLessons(location, targetCustomerId, 1, 99999);
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
      const groupLessonsResult = await getReceivePaymentGroupLessons(location, targetCustomerId, 1, 99999);
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
      const invoicesResult = await getReceivePaymentInvoices(location, targetCustomerId, 1, 99999);
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
  }, [location, parseMoneyValue]);

  // NEW: Reload payment data when customer changes (for dropdown mode)
  const reloadPaymentData = useCallback(async (newCustomerId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update customer ID
      setCustomerIdState(newCustomerId);
      
      // Load customer name
      const customerData = await getCustomerView(location, newCustomerId);
      if (customerData) {
        setCustomerName(customerData.fullName);
      }
      
      // Load payment data
      await loadPaymentData(newCustomerId);
      
    } catch (err) {
      console.error('Error reloading payment data:', err);
      setError('Failed to load payment data for selected customer');
    } finally {
      setIsLoading(false);
    }
  }, [location, loadPaymentData]);

  // Load all data on mount
  const loadAllData = useCallback(async () => {
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

      // Load customers list if NOT in customer route
      if (!isCustomerRoute) {
        await loadCustomersList();
      }

      // Load customer-specific data if customerId is provided
      if (customerId && customerId !== 0) {
        // Load customer data (only if in customer route)
        if (isCustomerRoute) {
          const customerData = await getCustomerView(location, customerId);
          if (customerData) {
            setCustomerName(customerData.fullName);
            setCustomerIdState(customerData.id);
          }
        }

        // Load payment data
        await loadPaymentData(customerId);
      }

    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [location, customerId, isCustomerRoute, loadCustomersList, loadPaymentData]);

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
    totalOutstanding,
    isLoading,
    error,
    setLessons,
    setGroupLessons,
    setInvoices,
    setCredits,
    // NEW: Customer dropdown data
    customersList,
    isLoadingCustomers,
    reloadPaymentData,
  };
};