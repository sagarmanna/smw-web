// api/payments.api.ts
import { apiClient } from '@/lib/api/client';

// ==========================================
// INTERFACES
// ==========================================

export interface PaymentDto {
  id: number;
  number: string;
  date: string;
  customer: string;
  paymentMethod: string;
  notes: string;
  reference: string;
  amount: string;
}

export interface PaymentsListResponse {
  success: boolean;
  message: string;
  data: {
    body: PaymentDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch payments list with pagination and filters
 * Endpoint: GET /admin/v2/{location}/payments
 */
export async function getPayments(
  location: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    number?: string;
    from?: string;
    to?: string;
    customer?: string;
    paymentMethod?: string;
    amount?: string;
  }
): Promise<{
  data: PaymentDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    // Add filters if provided
    if (filters?.number) {
      params.append('number', filters.number);
    }
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }
    if (filters?.customer) {
      params.append('customer', filters.customer);
    }
    if (filters?.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }
    if (filters?.amount) {
      params.append('amount', filters.amount);
    }

    const response = await apiClient.get<PaymentsListResponse>(
      `/admin/v2/${location}/payments`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 20,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching payments:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}