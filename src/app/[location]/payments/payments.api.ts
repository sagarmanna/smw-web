/// api/payments.api.ts
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
// HELPER FUNCTIONS
// ==========================================

/**
 * Get today's date in YYYY-MM-DD format using US timezone
 * Defaults to America/New_York (EST/EDT)
 */
function getTodayInUSTimezone(timezone: string = 'America/New_York'): string {
  const now = new Date();
  
  // Format date in US timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch payments list with pagination and filters
 * Endpoint: GET /admin/v2/{location}/payments
 * 
 * The API supports the following query parameters:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 20)
 * - number: Filter by payment number
 * - customer: Filter by customer name
 * - paymentMethod: Filter by payment method
 * - amount: Filter by amount
 * - startDate: Filter by start date (Format: YYYY-MM-DD)
 * - endDate: Filter by end date (Format: YYYY-MM-DD)
 * - sortBy: Field to sort by
 * - sortOrder: Sort order (ASC or DESC)
 */
export async function getPayments(
  location: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    number?: string;
    customer?: string;
    paymentMethod?: string;
    amount?: string;
    from?: string;  // Will be sent as startDate
    to?: string;    // Will be sent as endDate
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  },
  timezone: string = 'America/New_York' // Allow timezone configuration
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
    
    // Pagination
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '999' : limit.toString());

    // Add all supported filters
    if (filters?.number) {
      params.append('number', filters.number);
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
    
    // Sorting parameters - Always send sorting params
    // Default to date ASC if not specified
    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'ASC';
    
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    // Date filters - API uses startDate and endDate
    // IMPORTANT: API applies a default date filter if not provided
    // Always send date range to ensure we get all records
    if (filters?.from || filters?.to) {
      // User has applied date filters
      if (filters.from) {
        params.append('startDate', filters.from);
      }
      if (filters.to) {
        params.append('endDate', filters.to);
      }
    } else {
      // No user filters - default to current month (today's date in US timezone)
      const todayStr = getTodayInUSTimezone(timezone);
      
      params.append('startDate', todayStr);
      params.append('endDate', todayStr);
    }

    const response = await apiClient.get<PaymentsListResponse>(
      `/admin/v2/${location}/payments`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      const data = response.data.data.body;
      const pagination = response.data.data.pagination || {
        page: 1,
        limit: 20,
        total: data.length,
        totalPages: 1,
      };

      return {
        data,
        pagination,
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}