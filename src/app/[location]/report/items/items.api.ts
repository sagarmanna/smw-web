import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";

// Types
export interface Item {
  id: string;
  date: string;
  dateLabel: string; // Pre-formatted date string from API
  itemName: string;
  itemCode: string; // Item code from API
  amount: number | string; // Can be number or string from API
  customerName?: string;
  studentName?: string;
  description?: string;
  // Additional fields that might be present in the API response
  itemType?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  location?: string;
}

export interface ItemFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
  itemType?: string;
}

export interface ItemAPIResponse {
  success: boolean;
  data: {
    body: Item[];
    meta: {
      startDate: string;
      endDate: string;
      location: string;
      totalAmount: number;
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
 * Fetch items list with optional filters
 */
export async function getItemsList(
  location: string,
  filters?: ItemFilters
): Promise<ItemAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.startDate) params.append('startDate', format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append('endDate', format(filters.endDate, "yyyy-MM-dd"));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.itemType) params.append('itemType', filters.itemType);
    }

    const queryString = params.toString();
    const url = `/admin/v2/${location}/report/items${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);

    // Debug logging to understand the response structure
    console.log('Items API Response:', response.data);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Items report retrieved successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
        status?: number;
        statusText?: string;
      };
    };
    
    return {
      success: false,
      data: {
        body: [],
        meta: { startDate: '', endDate: '', location: '', totalAmount: 0 },
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
      },
      message: apiError.response?.data?.message || 'Failed to fetch items report'
    };
  }
}
