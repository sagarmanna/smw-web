import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";

// Types based on the image structure and actual API response
export interface TaxCollectedItem {
  sourceId: string;
  customer: string;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  dateLabel: string; // Pre-formatted date string from API
  // Additional fields that might be present in the API response
  location?: string;
  transactionType?: string;
}

// API response structure
export interface TaxCollectedAPIResponseData {
  dateLabel: string;
  items: {
    sourceId: string;
    customer: string;
    subtotal: string; // API returns as string
    tax: string; // API returns as string
    total: string; // API returns as string
  }[];
}

export interface TaxCollectedFilters {
  startDate?: Date;
  endDate?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
  customer?: string;
  sourceId?: string;
}

export interface TaxCollectedAPIResponse {
  success: boolean;
  data: {
    body: TaxCollectedItem[];
    meta: {
      startDate: string;
      endDate: string;
      location: string;
      totalSubtotal: number;
      totalTax: number;
      totalAmount: number;
    };
  };
  message?: string;
}

/**
 * Fetch tax collected items list with optional filters
 */
export async function getTaxCollectedList(
  location: string,
  filters?: TaxCollectedFilters
): Promise<TaxCollectedAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters (excluding page parameter)
    if (filters) {
      if (filters.startDate) params.append('startDate', format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append('endDate', format(filters.endDate, "yyyy-MM-dd"));
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.order) params.append('order', filters.order);
      if (filters.customer) params.append('customer', filters.customer);
      if (filters.sourceId) params.append('sourceId', filters.sourceId);
    }

    const queryString = params.toString();
    const url = `/admin/v2/burlington/report/tax-collected${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);


    // Transform the response data to match our interface
    const responseData = response.data.data || response.data;
    
    // Handle the API response structure with dateLabel and rows
    let items: TaxCollectedItem[] = [];
    let totalSubtotal = 0;
    let totalTax = 0;
    let totalAmount = 0;
    
    if (responseData.body && Array.isArray(responseData.body)) {
      // API returns { body: [{ dateLabel: "...", items: [...] }, ...] }
      
      // Flatten the data - each item in body has its own items array
      items = [];
      responseData.body.forEach((dateGroup: { dateLabel: string; items: Array<{ sourceId: string; customer: string; subtotal: string; tax: string; total: string }> }) => {
        if (dateGroup.items && Array.isArray(dateGroup.items)) {
          const dateItems = dateGroup.items.map((item: { sourceId: string; customer: string; subtotal: string; tax: string; total: string }) => ({
            sourceId: item.sourceId || '',
            customer: item.customer || '',
            subtotal: parseFloat(item.subtotal) || 0,
            tax: parseFloat(item.tax) || 0,
            total: parseFloat(item.total) || 0,
            date: dateGroup.dateLabel || '',
            dateLabel: dateGroup.dateLabel || ''
          }));
          items = items.concat(dateItems);
        }
      });
    } else if (responseData.items && Array.isArray(responseData.items)) {
      // API returns { dateLabel: "...", items: [...] }
      items = responseData.items.map((item: { sourceId: string; customer: string; subtotal: string; tax: string; total: string }) => {
        const transformedItem = {
          sourceId: item.sourceId || '',
          customer: item.customer || '',
          subtotal: parseFloat(item.subtotal) || 0,
          tax: parseFloat(item.tax) || 0,
          total: parseFloat(item.total) || 0,
          date: responseData.dateLabel || '',
          dateLabel: responseData.dateLabel || ''
        };
        return transformedItem;
      });
    } else if (responseData.rows && Array.isArray(responseData.rows)) {
      // Fallback: API returns { dateLabel: "...", rows: [...] } (legacy support)
      items = responseData.rows.map((item: { sourceId: string; customer: string; subtotal: string; tax: string; total: string }) => {
        const transformedItem = {
          sourceId: item.sourceId || '',
          customer: item.customer || '',
          subtotal: parseFloat(item.subtotal) || 0,
          tax: parseFloat(item.tax) || 0,
          total: parseFloat(item.total) || 0,
          date: responseData.dateLabel || '',
          dateLabel: responseData.dateLabel || ''
        };
        return transformedItem;
      });
    } else if (Array.isArray(responseData)) {
      // Handle case where response is directly an array
      items = responseData.map((item: { sourceId: string; customer: string; subtotal: string; tax: string; total: string; date?: string; dateLabel?: string }) => ({
        sourceId: item.sourceId || '',
        customer: item.customer || '',
        subtotal: parseFloat(item.subtotal) || 0,
        tax: parseFloat(item.tax) || 0,
        total: parseFloat(item.total) || 0,
        date: item.date || '',
        dateLabel: item.dateLabel || ''
      }));
    }
    
    // Calculate totals from the items
    totalSubtotal = items.reduce((sum: number, item: TaxCollectedItem) => sum + (item.subtotal || 0), 0);
    totalTax = items.reduce((sum: number, item: TaxCollectedItem) => sum + (item.tax || 0), 0);
    totalAmount = items.reduce((sum: number, item: TaxCollectedItem) => sum + (item.total || 0), 0);


    return {
      success: true,
      data: {
        body: items,
        meta: {
          startDate: responseData.meta?.startDate || '',
          endDate: responseData.meta?.endDate || '',
          location: responseData.meta?.location || location,
          totalSubtotal: responseData.meta?.totalSubtotal || totalSubtotal,
          totalTax: responseData.meta?.totalTax || totalTax,
          totalAmount: responseData.meta?.totalAmount || totalAmount,
        }
      },
      message: response.data.message || 'Tax collected report retrieved successfully'
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
        meta: { 
          startDate: '', 
          endDate: '', 
          location: '', 
          totalSubtotal: 0,
          totalTax: 0,
          totalAmount: 0 
        }
      },
      message: apiError.response?.data?.message || 'Failed to fetch tax collected report'
    };
  }
}
