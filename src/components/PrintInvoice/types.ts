export interface InvoicePrintCompanyInfo {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  hstRegistrationNo?: string;
}

export interface InvoicePrintCustomerInfo {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
}

export interface InvoicePrintLineItem {
  id: number;
  code: string;
  description: string;
  qty: number;
  price: string;
  unitPrice: string;
  tax: string;
}

export interface InvoicePrintPayment {
  date: string;
  type: string;
  reference: string;
  notes: string;
  amount: string;
}

export interface InvoicePrintTotals {
  discount: string;
  subTotal: string;
  tax: string;
  total: string;
  paid: string;
  balance: string;
}

export interface InvoicePrintInvoiceInfo {
  id: number;
  number: string;
  date: string;
  status: string;
  type: string;
  notes: string;
  reminderNotes: string;
}

export interface InvoicePrintData {
  invoice: InvoicePrintInvoiceInfo;
  customer: InvoicePrintCustomerInfo;
  location: InvoicePrintCompanyInfo;
  lineItems: InvoicePrintLineItem[];
  payments: InvoicePrintPayment[];
  totals: InvoicePrintTotals;
}
