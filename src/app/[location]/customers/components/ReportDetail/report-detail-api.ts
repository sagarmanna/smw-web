import { apiClient } from "@/lib/api/client";

// Raw row shapes from backend (no transformation)
export interface OutstandingInvoiceRaw {
  id: string;
  date: string;
  amount?: string;
  payments?: string;
  balanceDue?: string | number;
  owing?: string | number;
  url?: string;
}

export interface PrepaidLessonRaw {
  lessonId: string | number;
  lessonDate: string;
  status: string;
  paid: string | number;
}

export interface AvailableCreditRaw {
  id: string;
  date: string;
  amount: string | number;
}

// Common API envelope shapes used across the project
interface ApiListEnvelope<T> {
  success: boolean;
  message?: string;
  data: {
    body: T[];
    footer?: Array<Record<string, string>>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function getReportOutstandingInvoices(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<{
  data: OutstandingInvoiceRaw[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  footer?: Record<string, string>;
}> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<ApiListEnvelope<OutstandingInvoiceRaw>>(`/admin/v2/${location}/customers/${customerId}/outstanding-invoices`, {
      params,
    });

    const envelope = response.data;
    const body: OutstandingInvoiceRaw[] = envelope.data?.body || [];
    const pagination = envelope.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footer = (envelope.data?.footer && envelope.data.footer[0]) || undefined;

    return { data: body, pagination, footer };
  } catch (_err) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: undefined,
    };
  }
}

export async function getReportPrepaidLessons(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<{
  data: PrepaidLessonRaw[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  footer?: Record<string, string>;
}> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<ApiListEnvelope<PrepaidLessonRaw>>(`/admin/v2/${location}/customers/${customerId}/prepaid-lessons`, {
      params,
    });

    const envelope = response.data;
    const body: PrepaidLessonRaw[] = envelope.data?.body || [];
    const pagination = envelope.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footer = (envelope.data?.footer && envelope.data.footer[0]) || undefined;

    return { data: body, pagination, footer };
  } catch (_err) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: undefined,
    };
  }
}

export async function getReportAvailableCredits(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<{
  data: AvailableCreditRaw[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  footer?: Record<string, string>;
}> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<ApiListEnvelope<AvailableCreditRaw>>(`/admin/v2/${location}/customers/${customerId}/available-credits`, {
      params,
    });

    const envelope = response.data;
    const body: AvailableCreditRaw[] = envelope.data?.body || [];
    const pagination = envelope.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footer = (envelope.data?.footer && envelope.data.footer[0]) || undefined;

    return { data: body, pagination, footer };
  } catch (_err) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: undefined,
    };
  }
}


