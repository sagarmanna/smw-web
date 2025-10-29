/// types.ts
import * as React from 'react';

export interface LessonItem {
  id: string;
  selected: boolean;
  date: string;
  dueDate: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
  balance: number;
  payment: string;
}

export interface GroupLessonItem {
  id: string;
  selected: boolean;
  date: string;
  dueDate: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
  balance: number;
  payment: string;
}

export interface InvoiceItem {
  id: string;
  selected: boolean;
  date: string;
  number: string;
  status: string;
  amount: number; // Total amount of invoice
  payments: number; // Amount already paid
  balance: number; // Outstanding balance (from API directly)
  payment: string; // New payment amount being entered
}

export interface CreditItem {
  id: string;
  selected: boolean;
  type: string;
  reference: string;
  amount: number;
  payment: string;
}

export interface TableRow<T> {
  original: T;
}

export interface ColumnDefinition<T = unknown> {
  id?: string;
  accessorKey?: string;
  header: string | (() => React.ReactNode);
  cell?: ({ row }: { row: TableRow<T> }) => React.ReactNode;
  size?: number;
  filter?: FilterConfig;
}

export interface ReceivePaymentData {
  customer: string;
  date: string;
  paymentMethod: string;
  reference: string;
  amountReceived: number;
  notes: string;
  selectedLessons: string[];
  selectedGroupLessons: string[];
  selectedInvoices: string[];
  selectedCredits: string[];
  lessonPayments: Record<string, number>;
  groupLessonPayments: Record<string, number>;
  invoicePayments: Record<string, number>;
  creditPayments: Record<string, number>;
}

export interface PaymentCalculations {
  availableCredits: number;
  selectedCredits: number;
  lessonPayments: number;
  groupLessonPayments: number;
  invoicePayments: number;
  amountToApply: number;
  amountToCredit: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReceivePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ReceivePaymentData) => void;
  customerName?: string;
  customerId?: string;
  location?: string;
  amountNeeded?: number;
}

export interface PaymentTablesSectionProps {
  // Lessons
  lessons: LessonItem[];
  lessonColumns: ColumnDefinition[];
  lessonColumnFilters: ColumnFilter;
  onLessonFilterChange: (columnKey: string, filterValue: unknown) => void;
  
  // Group Lessons
  groupLessons: GroupLessonItem[];
  groupLessonColumns: ColumnDefinition[];
  groupLessonColumnFilters: ColumnFilter;
  onGroupLessonFilterChange: (columnKey: string, filterValue: unknown) => void;
  
  // Invoices
  invoices: InvoiceItem[];
  invoiceColumns: ColumnDefinition[];
  
  // Credits
  credits: CreditItem[];
  creditColumns: ColumnDefinition[];
  
  // Calculations
  calculations: PaymentCalculations;
  
  // Pagination for lessons
  lessonsPagination?: PaginationState;
  lessonsLoading?: boolean;
  onLessonsPageChange?: (page: number) => void;
  onLessonsRowsPerPageChange?: (rowsPerPage: number) => void;
  
  // Pagination for invoices
  invoicesPagination?: PaginationState;
  invoicesLoading?: boolean;
  onInvoicesPageChange?: (page: number) => void;
  onInvoicesRowsPerPageChange?: (rowsPerPage: number) => void;
}

export interface FilterConfig {
  type: 'date-range' | 'dropdown' | 'text';
  disabled?: (date: Date) => boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface ColumnFilter {
  [key: string]: unknown;
}