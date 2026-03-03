import { apiClient } from "@/lib/api/client";

export interface InvoiceEmailStatementLineItem {
  code?: string;
  description?: string;
  qty?: number | string;
  price?: string;
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
