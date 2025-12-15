// Customer Detail Component Types and Interfaces

export interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

export interface Email {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  postalCode: string;
  note?: string;
  isPrimary?: boolean;
}

export interface CustomerDetailClientProps {
  location: string;
  id: string;
}

export interface PaymentReceiptLesson {
  date: string;
  student: string;
  program: string;
  teacher: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface PaymentReceiptGroupLesson {
  date: string;
  student: string;
  program: string;
  amount: string;
  balance: string;
}

export interface PaymentReceiptInvoice {
  date: string;
  number: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface DirectPaymentReceiptData {
  date: string;
  paymentMethod: string;
  reference: string;
  amount: number;
  lessons?: PaymentReceiptLesson[];
  groupLessons?: PaymentReceiptGroupLesson[];
  invoices?: PaymentReceiptInvoice[];
}

export interface EmailModalOverrides {
  subject?: string;
  content?: string;
}

export interface PaymentReceiveLessonDetail {
  id: string;
  date: string;
  dueDate?: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
  balance: number;
  payment: string;
}

export interface PaymentReceiveGroupLessonDetail {
  id: string;
  date: string;
  student: string;
  program: string;
  amount: number;
  balance: number;
  payment: string;
}

export interface PaymentReceiveInvoiceDetail {
  id: string;
  date: string;
  number: string;
  amount: number;
  balance: number;
  payment: string;
}

export interface PaymentReceiveCreditDetail {
  id: string;
  reference: string;
  payment: string;
  type: string;
}

export interface ReceivePaymentFormData {
  customer: string;
  date: string;
  paymentMethod: string;
  paymentMethodName?: string;
  reference: string;
  amountReceived: number;
  notes: string;
  selectedLessons: string[];
  selectedGroupLessons?: string[];
  selectedInvoices?: string[];
  selectedCredits?: string[];
  lessonPayments: Record<string, number>;
  groupLessonPayments?: Record<string, number>;
  invoicePayments?: Record<string, number>;
  paymentCredits?: Record<string, number>;
  invoiceCredits?: Record<string, number>;
  lessonDetails?: PaymentReceiveLessonDetail[];
  groupLessonDetails?: PaymentReceiveGroupLessonDetail[];
  invoiceDetails?: PaymentReceiveInvoiceDetail[];
  creditDetails?: PaymentReceiveCreditDetail[];
}

export interface CustomerDetailsSaveData {
  firstName: string;
  lastName: string;
  role: string;
  referralSource: string;
  status: string;
  picture?: string;
}

export interface TabPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
