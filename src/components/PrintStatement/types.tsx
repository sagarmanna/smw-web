// /component/printStatement/types.tsx

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

export interface PrintStatementConfig {
  title: string;
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  tables: TableConfig[];
  footer?: string;
  logoUrl: string;
  hstNumber?: string;
  totalBalance: string;
}

// Customer Statement Specific Types

export interface StatementLessonRow {
  date: string;
  student: string;
  program: string;
  teacher: string;
  amount: string;
  balance: string;
}

export interface StatementGroupLessonRow {
  date: string;
  student: string;
  program: string;
  teacher: string;
  amount: string;
  balance: string;
}

export interface StatementInvoiceRow {
  date: string;
  number: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface StatementCreditRow {
  type: string;
  reference: string;
  date: string;
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

export interface CustomerStatementData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  hstNumber?: string;
  locationDetails?: LocationDetails | null;
  lessonRows?: StatementLessonRow[];
  groupLessonRows?: StatementGroupLessonRow[];
  invoiceRows?: StatementInvoiceRow[];
  creditRows?: StatementCreditRow[];
  totalBalance: string;
}

