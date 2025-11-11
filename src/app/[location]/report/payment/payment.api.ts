import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";

// Types
export interface Payment {
  paymentId: string;
  paymentDate: string;
  amount: number | string;
  paymentMethodId: number;
  paymentMethodName: string;
  customer: string;
  students?: string;
  userId: string;
  reference: string | null;
}

export interface PaymentSummary {
  paymentDate: string;
  paymentMethod: string;
  amount: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
  summaryOnly?: boolean;
}

export interface PaymentAPIResponse {
  success: boolean;
  data: {
    body: (Payment | PaymentSummary)[];
    footer: {
      amount: string;
    };
    meta: {
      startDate: string;
      endDate: string;
      location: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/**
 * Fetch payments list with optional filters
 */
export async function getPaymentList(
  location: string,
  filters?: PaymentFilters
): Promise<PaymentAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.startDate) params.append('startDate', format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append('endDate', format(filters.endDate, "yyyy-MM-dd"));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.summaryOnly) params.append('summaryOnly', filters.summaryOnly.toString());
    }

    const response = await apiClient.get(`/admin/v2/${location}/report/payment`, { params });

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Payments report retrieved successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
        footer: { amount: "0" },
        meta: { startDate: '', endDate: '', location: '' },
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
      },
      message: apiError.response?.data?.message || 'Failed to fetch payments report'
    };
  }
}