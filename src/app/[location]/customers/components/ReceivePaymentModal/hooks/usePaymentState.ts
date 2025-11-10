// hooks/usePaymentState.ts
import { useState, useEffect } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, ColumnFilter } from '../types';
import { usePaymentData } from './usePaymentData';

/**
 * Custom hook for managing payment modal state with API integration
 * Following Single Responsibility Principle - handles only state management
 * No pagination - loads all data at once
 */
export const usePaymentState = (
  location: string,
  customerId: number,
  initialCustomerName?: string
) => {
  // Fetch all data from APIs at once
  const { 
    lessons: apiLessons,
    groupLessons: apiGroupLessons,
    invoices: apiInvoices,
    credits: apiCredits,
    paymentMethods: apiPaymentMethods,
    customerName: apiCustomerName,
    customerId: apiCustomerId,
    totalOutstanding,
    isLoading,
    error,
  } = usePaymentData(location, customerId);

  // Form state
  const [customer, setCustomer] = useState(initialCustomerName || '');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [amountReceived, setAmountReceived] = useState('0.00');
  const [notes, setNotes] = useState('');
  
  // Filter state - Initialize with empty filters (no date filter by default)
  const [lessonColumnFilters, setLessonColumnFilters] = useState<ColumnFilter>({});
  const [groupLessonColumnFilters, setGroupLessonColumnFilters] = useState<ColumnFilter>({});
  
  // Data state - using API data for all tables
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [credits, setCredits] = useState<CreditItem[]>([]);
  
  // Available payment methods from API
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<Array<{ value: string; label: string }>>([]);

  // Update customer data when API data is loaded
  useEffect(() => {
    if (apiCustomerName) {
      setCustomer(apiCustomerName);
    }
    if (apiCustomerId) {
      setCustomerIdState(apiCustomerId);
    }
  }, [apiCustomerName, apiCustomerId]);

  // Update lessons when API data is loaded
  useEffect(() => {
    if (apiLessons.length > 0) {
      setLessons(apiLessons);
    }
  }, [apiLessons]);

  // Update group lessons when API data is loaded
  useEffect(() => {
    if (apiGroupLessons.length > 0) {
      setGroupLessons(apiGroupLessons);
    }
  }, [apiGroupLessons]);

  // Update invoices when API data is loaded
  useEffect(() => {
    if (apiInvoices.length > 0) {
      setInvoices(apiInvoices);
    }
  }, [apiInvoices]);

  // Update credits when API data is loaded
  useEffect(() => {
    if (apiCredits.length > 0) {
      setCredits(apiCredits);
    }
  }, [apiCredits]);

  // Update payment methods when API data is loaded and set "Cash" as default
  useEffect(() => {
    if (apiPaymentMethods.length > 0) {
      setAvailablePaymentMethods(apiPaymentMethods);
      
      // Set "Cash" as default payment method if available
      const cashMethod = apiPaymentMethods.find(
        method => method.label.toLowerCase() === 'cash'
      );
      
      if (cashMethod) {
        setPaymentMethod(cashMethod.value);
      } else if (apiPaymentMethods[0]) {
        // Fallback to first payment method if "Cash" is not available
        setPaymentMethod(apiPaymentMethods[0].value);
      }
    }
  }, [apiPaymentMethods]);

  // Set default amount received to total outstanding when data is loaded
  useEffect(() => {
    if (totalOutstanding > 0 && amountReceived === '0.00') {
      setAmountReceived(totalOutstanding.toFixed(2));
    }
  }, [totalOutstanding, amountReceived]);

  return {
    // Form state
    customer,
    setCustomer,
    customerId: customerIdState,
    paymentDate,
    setPaymentDate,
    paymentMethod,
    setPaymentMethod,
    reference,
    setReference,
    amountReceived,
    setAmountReceived,
    notes,
    setNotes,
    
    // Filter state
    lessonColumnFilters,
    setLessonColumnFilters,
    groupLessonColumnFilters,
    setGroupLessonColumnFilters,
    
    // Data state
    lessons,
    setLessons,
    groupLessons,
    setGroupLessons,
    invoices,
    setInvoices,
    credits,
    setCredits,
    
    // API data
    availablePaymentMethods,
    totalOutstanding,
    isLoading,
    error,
  };
};