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
  initialCustomerName?: string,
  shouldLoad: boolean = true,
  isCustomerRoute: boolean = true
) => {
  // Fetch all data from APIs at once - only when shouldLoad is true
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
    customersList,
    isLoadingCustomers,
    reloadPaymentData,
  } = usePaymentData(location, customerId, shouldLoad, isCustomerRoute);

  // Form state - customer stores the customer ID as string
  const [customer, setCustomer] = useState(customerId > 0 ? customerId.toString() : '0');
  const [customerIdState, setCustomerIdState] = useState<number>(customerId);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [amountReceived, setAmountReceived] = useState('0.00');
  const [notes, setNotes] = useState('');
  
  // Filter state
  const [lessonColumnFilters, setLessonColumnFilters] = useState<ColumnFilter>({});
  const [groupLessonColumnFilters, setGroupLessonColumnFilters] = useState<ColumnFilter>({});
  
  // Data state
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [credits, setCredits] = useState<CreditItem[]>([]);
  
  // Available payment methods from API
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<Array<{ value: string; label: string }>>([]);

  // Update customer data when API data is loaded or customerId prop changes
  useEffect(() => {
    if (apiCustomerId && apiCustomerId > 0) {
      setCustomerIdState(apiCustomerId);
      setCustomer(apiCustomerId.toString());
      console.log('usePaymentState: Set customer ID to', apiCustomerId);
    }
  }, [apiCustomerId]);

  // Sync with initial customerId prop
  useEffect(() => {
    if (customerId > 0) {
      setCustomerIdState(customerId);
      setCustomer(customerId.toString());
      console.log('usePaymentState: Synced with prop customerId', customerId);
    }
  }, [customerId]);

  // Update lessons when API data is loaded
  useEffect(() => {
    setLessons(apiLessons);
  }, [apiLessons]);

  // Update group lessons when API data is loaded
  useEffect(() => {
    setGroupLessons(apiGroupLessons);
  }, [apiGroupLessons]);

  // Update invoices when API data is loaded
  useEffect(() => {
    setInvoices(apiInvoices);
  }, [apiInvoices]);

  // Update credits when API data is loaded
  useEffect(() => {
    setCredits(apiCredits);
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

  // Handle customer selection from dropdown - this is the main function for dropdown mode
  const handleCustomerChange = async (selectedCustomerId: string) => {
    console.log('handleCustomerChange called with:', selectedCustomerId);
    const newCustomerId = parseInt(selectedCustomerId);
    
    if (newCustomerId && newCustomerId !== customerIdState && newCustomerId > 0) {
      // Update customer ID state IMMEDIATELY
      setCustomerIdState(newCustomerId);
      setCustomer(selectedCustomerId); // Store ID as string
      
      console.log('Customer changed to:', newCustomerId);
      
      // Reload payment data for new customer
      await reloadPaymentData(newCustomerId);
      
      // Reset amount received after data loads
      setAmountReceived('0.00');
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!shouldLoad) {
      setCustomer(customerId > 0 ? customerId.toString() : '0');
      setCustomerIdState(customerId);
      setPaymentDate(new Date());
      setPaymentMethod('');
      setReference('');
      setAmountReceived('0.00');
      setNotes('');
      setLessonColumnFilters({});
      setGroupLessonColumnFilters({});
      setLessons([]);
      setGroupLessons([]);
      setInvoices([]);
      setCredits([]);
    }
  }, [shouldLoad, customerId]);

  return {
    // Form state - customer is now the ID as string
    customer, // This is the customer ID as string
    setCustomer, // Direct setter (used by handleCustomerChange)
    customerId: customerIdState, // Numeric customer ID
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
    
    // Customer dropdown support
    isInCustomerRoute: isCustomerRoute,
    customersList,
    isLoadingCustomers,
    handleCustomerChange, // This updates both customer ID and reloads data
  };
};