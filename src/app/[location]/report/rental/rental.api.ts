import { apiClient } from "@/lib/api/client";

// Types
export interface RentalRow {
  customer: string;
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  equipmentReturned: string;
  equipmentReturnedDate?: string;
}

export interface RentalStats {
  total: number;
  active: number;
  overdue: number;
  returned: number;
}

export interface RentalFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filterType?: 'active_current' | 'active_expiring' | 'active_overdue' | 'returned' | 'active';
}

export interface RentalsAPIResponse {
  success: boolean;
  data: {
    body: RentalRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface RentalStatsAPIResponse {
  success: boolean;
  data: RentalStats;
  message?: string;
}

// API Functions
export async function getRentalsList(
  location: string,
  filters?: RentalFilters
): Promise<RentalsAPIResponse> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.filterType) params.append('filterType', filters.filterType);
    }

    const response = await apiClient.get(`/admin/v2/${location}/report/rental`, { params });
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      },
      message: apiError.response?.data?.message || 'Failed to fetch rentals',
    };
  }
}

export async function getRentalStats(location: string): Promise<RentalStatsAPIResponse> {
  try {
    const response = await apiClient.get(`/admin/v2/${location}/report/rental/stats`);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: { total: 0, active: 0, overdue: 0, returned: 0 },
      message: apiError.response?.data?.message || 'Failed to fetch rental stats',
    };
  }
}

export async function testApiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.get(`/admin/v2/training-location/report/rental`);
    return { success: true, message: 'API connection successful' };
  } catch (error: unknown) {
    const apiError = error as { message?: string };
    return { success: false, message: `API connection failed: ${apiError.message || 'Unknown error'}` };
  }
}
