// Shared Invoice types for the invoices feature.
// Keep this file types-only (no mock data / no API calls).

export interface InvoiceItem {
  id: string;
  code?: string;
  royalty?: string;
  free?: string;
  description: string;
  qty: number;
  discount?: number;
  taxStatus?: string;
  tax?: number;
  unitPrice?: number;
  cost?: number;
  price: number;
}

export interface InvoicePayment {
  id: number;
  date: string;
  type: string;
  ref: string;
  notes: string;
  amount: string;
}

export interface InvoiceComment {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export type InvoiceStatus = string;

export interface InvoiceCustomer {
  name: string;
  phone: string;
  email: string;
  customerId?: number;
  type?: 1 | 2;
}

export interface InvoiceTotals {
  discounts: number;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
}

export interface InvoiceHistoryEntry {
  id: number;
  createdOn: string;
  message: string;
}

export interface InvoiceDetail {
  id: number;
  number: string;
  date: string;
  status: InvoiceStatus;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  totals: InvoiceTotals;
  message?: string;
  comments?: InvoiceComment[];
  history?: InvoiceHistoryEntry[];
}

