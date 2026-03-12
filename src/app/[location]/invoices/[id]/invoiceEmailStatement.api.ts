import { apiClient } from "@/lib/api/client";

export interface InvoiceEmailStatementLineItem {
  code?: string;
  description?: string;
  qty?: number | string;
  price?: string;
}

export interface InvoiceEmailStatementPayment {
  date?: string;
  type?: string;
  ref?: string;
  amount?: string;
}

export interface InvoiceEmailStatementTotals {
  subtotal?: string;
  tax?: string;
  total?: string;
  paid?: string;
  balance?: string;
}

export interface InvoiceEmailStatementTemplate {
  id?: number;
  to?: string;
  subject?: string;
  header?: string;
  footer?: string;
}

export interface InvoiceEmailStatementBody {
  content?: {
    lineItems?: InvoiceEmailStatementLineItem[];
    message?: string;
    totals?: InvoiceEmailStatementTotals;
    hstNumber?: string;
    payments?: InvoiceEmailStatementPayment[];
  };
  emailTemplate?: InvoiceEmailStatementTemplate;
}

export interface InvoiceEmailStatementResponse {
  success: boolean;
  data?: {
    body?: InvoiceEmailStatementBody;
  };
  message?: string;
}

export interface SendInvoiceEmailStatementRequest {
  to?: string[];
  subject?: string;
  content?: string;
}

export interface SendInvoiceEmailStatementResponse {
  success: boolean;
  data?: {
    body?: {
      invoiceId?: number;
      isSent?: boolean;
    };
  };
  message?: string;
}

export async function getInvoiceEmailStatement(
  location: string,
  invoiceId: number
): Promise<InvoiceEmailStatementResponse | null> {
  try {
    const response = await apiClient.get<InvoiceEmailStatementResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/email-statement`
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function sendInvoiceEmailStatement(
  location: string,
  invoiceId: number,
  payload: SendInvoiceEmailStatementRequest
): Promise<SendInvoiceEmailStatementResponse | null> {
  try {
    const response = await apiClient.post<SendInvoiceEmailStatementResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/send-email`,
      payload
    );
    return response.data;
  } catch {
    return null;
  }
}
