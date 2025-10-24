/// hooks/usePaymentState.ts
import { useState } from 'react';
import { LessonItem, InvoiceItem, CreditItem, GroupLessonItem, ColumnFilter } from '../types';
import { createMockLessons, createMockGroupLessons, createMockInvoices, createMockCredits } from '../mockData';
import { DEFAULT_PAYMENT_METHOD, DEFAULT_AMOUNT_RECEIVED } from '../constants';

/**
 * Custom hook for managing payment modal state
 * Following Single Responsibility Principle - handles only state management
 */
export const usePaymentState = (customerId: string) => {
  // Form state
  const [customer, setCustomer] = useState(customerId);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [reference, setReference] = useState('');
  const [amountReceived, setAmountReceived] = useState(DEFAULT_AMOUNT_RECEIVED);
  const [notes, setNotes] = useState('');
  
  // Filter state
  const [lessonColumnFilters, setLessonColumnFilters] = useState<ColumnFilter>({});
  const [groupLessonColumnFilters, setGroupLessonColumnFilters] = useState<ColumnFilter>({});
  
  // Data state
  const [lessons, setLessons] = useState<LessonItem[]>(createMockLessons());
  const [groupLessons, setGroupLessons] = useState<GroupLessonItem[]>(createMockGroupLessons());
  const [invoices, setInvoices] = useState<InvoiceItem[]>(createMockInvoices());
  const [credits, setCredits] = useState<CreditItem[]>(createMockCredits());

  return {
    // Form state
    customer,
    setCustomer,
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
  };
};