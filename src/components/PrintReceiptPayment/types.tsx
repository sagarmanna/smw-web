// /component/printReceiptPayment/types.tsx

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface TableConfig {
  title: string;
  headers: string[];
  rows: Array<Record<string, string>>;
  alignments?: string[];
}

export interface PrintReceiptConfig {
  title: string;
  headerAmount: string;
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  acknowledgmentMessage: string;
  tables: TableConfig[];
  footer?: string;
  logoUrl: string;
  hstNumber?: string;
}

// Payment Receipt Specific Types

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

export interface GroupLessonRow {
  date: string;
  student: string;
  program: string;
  invoiced: string;
  amount: string;
  balance: string;
}

export interface InvoiceRow {
  date: string;
  number: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface ReceiptRow {
  reference: string;
  date: string;
  method: string;
  amount: string;
}

export interface LocationDetails {
  name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  hstRegistrationNo: string;
}

export interface PaymentReceiptData {
  headerAmount: string;
  paymentDate?: string;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  hstNumber?: string;
  locationDetails?: LocationDetails | null;
  allocationRows?: AllocationRow[];
  groupLessonRows?: GroupLessonRow[];
  invoiceRows?: InvoiceRow[];
  receiptRows?: ReceiptRow[];
}