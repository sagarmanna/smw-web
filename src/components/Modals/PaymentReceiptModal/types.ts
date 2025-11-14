import * as React from "react";

// Payment Method
export interface PaymentMethod {
  id: number;
  name: string;
}

// Row Types
export interface AllocationRow {
  originalDate: string;
  date: string;
  student: string;
  program: string;
  teacher: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface EditLessonRow extends AllocationRow {
  allocation: number;
}

export interface GroupLessonRow {
  date: string;
  student: string;
  program: string;
  invoiced: string;
  amount: string;
  balance: string;
}

export interface GroupLessonEditRow extends GroupLessonRow {
  allocation: number;
}

export interface InvoiceRow {
  date: string;
  number: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface InvoiceEditRow extends InvoiceRow {
  allocation: number;
}

export interface ReceiptRow {
  reference: string;
  date: string;
  method: string;
  amount: string;
}

// Edit Form Data
export interface EditFormData {
  date: string;
  method: string;
  reference: string;
  amountReceived: string;
}

// Main Props Interface
export interface PaymentReceiptModalUIProps {
  // Modal state
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  showDeleteConfirm: boolean;
  isSaving: boolean;
  isLoadingPaymentMethods: boolean;
  
  // Display data
  headerAmount: string;
  paymentDate?: string;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  showAllocations: boolean;
  receiptHtml?: string;
  receiptHtmlRef?: React.RefObject<HTMLDivElement | null>;
  
  // Tables data
  allocationRows: AllocationRow[];
  groupLessonRows: GroupLessonRow[];
  invoiceRows: InvoiceRow[];
  receiptRows: ReceiptRow[];
  
  // Edit mode data
  editDate: Date;
  editForm: EditFormData;
  paymentMethods: PaymentMethod[];
  lessonEditRows: EditLessonRow[];
  groupLessonEditRows: GroupLessonEditRow[];
  invoiceEditRows: InvoiceEditRow[];
  amountToApply: number;
  amountToCredit: number;
  
  // Callbacks
  onEditDateChange: (date: Date) => void;
  onEditFormChange: (form: EditFormData) => void;
  onLessonAllocationChange: (index: number, value: number) => void;
  onGroupLessonAllocationChange: (index: number, value: number) => void;
  onInvoiceAllocationChange: (index: number, value: number) => void;
  onEditClick: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onPrint: () => void;
  onEmail: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  
  // Optional HTML receipt callbacks
  onEmailFormSubmit?: () => void;
  onPrintFromHtml?: () => void;
}