import { apiClient } from "@/lib/api/client";

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: {
    status?: number;
    data?: unknown;
    statusText?: string;
    code?: string;
  };
}> {
  try {
    const response = await apiClient.get(`/admin/v2/training-location/report/account-receivable`);
    
    return {
      success: true,
      message: 'API connection successful',
      details: {
        status: response.status,
        data: response.data
      }
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { status?: number; statusText?: string };
      code?: string;
      message?: string;
    };
    
    return {
      success: false,
      message: `API connection failed: ${apiError.message || apiError.code || 'Unknown error'}`,
      details: {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        code: apiError.code
      }
    };
  }
}

export interface AccountReceivableRow {
  id: number;
  customerName: string;
  status: string;
  aging_0_30: number;
  aging_31_60: number;
  aging_61_90: number;
  aging_90_plus: number;
  total: number;
  prePaidLessons: number;
  unusedCredits: number;
  balance: number;
}

export interface AccountReceivableFilters {
  showAllActive?: boolean;
  showAllInActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AccountReceivableAPIResponse {
  success: boolean;
  data: {
    body: AccountReceivableRow[];
    footer: {
      aging_0_30: number;
      aging_31_60: number;
      aging_61_90: number;
      aging_90_plus: number;
      total: number;
      prePaidLessons: number;
      unusedCredits: number;
      balance: number;
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
 * Fetch account receivable list with optional filters
 */
export async function getAccountReceivableList(
  location: string,
  filters?: AccountReceivableFilters
): Promise<AccountReceivableAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = `/admin/v2/${location}/report/account-receivable${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    
    // Handle different response data structures
    let accountReceivableData: {
      body: Record<string, unknown>[];
      footer: {
        aging_0_30: number;
        aging_31_60: number;
        aging_61_90: number;
        aging_90_plus: number;
        total: number;
        prePaidLessons: number;
        unusedCredits: number;
        balance: number;
      };
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    } = {
      body: [],
      footer: {
        aging_0_30: 0,
        aging_31_60: 0,
        aging_61_90: 0,
        aging_90_plus: 0,
        total: 0,
        prePaidLessons: 0,
        unusedCredits: 0,
        balance: 0
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };

    if (response.data && typeof response.data === 'object') {
      // Check for nested data structures
      if (response.data.data && response.data.data.body && Array.isArray(response.data.data.body)) {
        // Handle: { data: { body: [...], footer: {...}, pagination: {...} } }
        accountReceivableData = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Handle: { data: [...] }
        accountReceivableData.body = response.data.data;
      } else if (response.data.body && Array.isArray(response.data.body)) {
        // Handle: { body: [...] }
        accountReceivableData = response.data;
      } else if (Array.isArray(response.data)) {
        // Handle: [...] directly
        accountReceivableData.body = response.data;
      }
    }
    
    // Transform data to ensure consistent field names
    const transformedData = accountReceivableData.body.map((item: Record<string, unknown>): AccountReceivableRow => {
      return {
        id: Number(item.id || item.ID || item.Id) || 0,
        customerName: String(item.customerName || item.customer_name || item.CustomerName || item.CUSTOMER_NAME || ''),
        status: String(item.status || item.Status || item.STATUS || ''),
        aging_0_30: Number(item.aging_0_30 || item['0-30']) || 0,
        aging_31_60: Number(item.aging_31_60 || item['31-60']) || 0,
        aging_61_90: Number(item.aging_61_90 || item['61-90']) || 0,
        aging_90_plus: Number(item.aging_90_plus || item['90+']) || 0,
        total: Number(item.total || item.Total || item.TOTAL) || 0,
        prePaidLessons: Number(item.prePaidLessons || item.pre_paid_lessons || item.PrePaidLessons || item.PRE_PAID_LESSONS) || 0,
        unusedCredits: Number(item.unusedCredits || item.unused_credits || item.UnusedCredits || item.UNUSED_CREDITS) || 0,
        balance: Number(item.balance || item.Balance || item.BALANCE) || 0
      };
    });
    
    return {
      success: true,
      data: {
        body: transformedData,
        footer: accountReceivableData.footer,
        pagination: accountReceivableData.pagination
      },
      message: 'Account receivable data fetched successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      request?: unknown;
      code?: string;
    };
    
    return {
      success: false,
      data: {
        body: [],
        footer: {
          aging_0_30: 0,
          aging_31_60: 0,
          aging_61_90: 0,
          aging_90_plus: 0,
          total: 0,
          prePaidLessons: 0,
          unusedCredits: 0,
          balance: 0
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      },
      message: apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || 'Failed to fetch account receivable data'
    };
  }
}

/**
 * Get account receivable statistics
 */
export async function getAccountReceivableStats(location: string): Promise<{
  success: boolean;
  data?: {
    totalCustomers: number;
    totalOutstanding: number;
    totalPrePaid: number;
    totalCredits: number;
    totalBalance: number;
  };
  message?: string;
}> {
  try {
    const response = await apiClient.get(`/admin/v2/${location}/report/account-receivable/stats`, {
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    if (response.status === 404) {
      // Try to calculate stats from the main data
      try {
        const accountReceivableResponse = await getAccountReceivableList(location);
        if (accountReceivableResponse.success && accountReceivableResponse.data) {
          const data = accountReceivableResponse.data;
          
          const stats = {
            totalCustomers: data.body.length,
            totalOutstanding: data.footer.total,
            totalPrePaid: data.footer.prePaidLessons,
            totalCredits: data.footer.unusedCredits,
            totalBalance: data.footer.balance
          };
          
          return {
            success: true,
            data: stats,
            message: 'Stats calculated from account receivable data (stats endpoint not available)'
          };
        }
      } catch {
        // Error calculating stats from data
      }
      
      return {
        success: true,
        data: {
          totalCustomers: 0,
          totalOutstanding: 0,
          totalPrePaid: 0,
          totalCredits: 0,
          totalBalance: 0
        },
        message: 'Stats endpoint not available - using default values'
      };
    }
    
    // Handle different response data structures for stats
    let statsData = response.data;
    if (response.data && typeof response.data === 'object') {
      if (response.data.data && response.data.data.summary) {
        statsData = response.data.data.summary;
      } else if (response.data.data && response.data.data.stats) {
        statsData = response.data.data.stats;
      } else if (response.data.stats) {
        statsData = response.data.stats;
      } else if (response.data.data) {
        statsData = response.data.data;
      } else if (response.data.summary) {
        statsData = response.data.summary;
      }
    }
    
    return {
      success: true,
      data: statsData,
      message: 'Account receivable statistics fetched successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      code?: string;
    };
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account receivable statistics';
    return {
      success: false,
      message: apiError.response?.data?.message || errorMessage
    };
  }
}
