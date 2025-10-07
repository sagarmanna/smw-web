import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";

// Types
export interface Royalty {
  "Payments Received": string;
  "Gift Card Payments": string;
  "Tax Collected": string;
  "Royalty Free Items": string;
  "Revenue": string;
  "Advertisement (5%)": string;
  "Royalty (3%)": string;
  "Subtotal": string;
  "Tax": string;
  "Total": string;
}

export interface RoyaltyFilters {
  startDate?: Date;
  endDate?: Date;
}

export interface RoyaltyAPIResponse {
  success: boolean;
  data: {
    body: Royalty;
    meta: {
      startDate: string;
      endDate: string;
      location: string;
    };
  };
  message?: string;
}

/**
 * Fetch royalty report with optional filters
 */
export async function getRoyalty(
  location: string,
  filters?: RoyaltyFilters
): Promise<RoyaltyAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters) {
      if (filters.startDate) params.append('startDate', format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append('endDate', format(filters.endDate, "yyyy-MM-dd"));
    }

    const queryString = params.toString();
    const url = `/admin/v2/${location}/report/royalty${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Royalty report retrieved successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
      };
    };
    
    return {
      success: false,
      data: {
        body: {
          "Payments Received": "0.00",
          "Gift Card Payments": "0.00",
          "Tax Collected": "0.00",
          "Royalty Free Items": "0.00",
          "Revenue": "0.00",
          "Advertisement (5%)": "0.00",
          "Royalty (3%)": "0.00",
          "Subtotal": "0.00",
          "Tax": "0.00",
          "Total": "0.00"
        },
        meta: { startDate: '', endDate: '', location: '' },
      },
      message: apiError.response?.data?.message || 'Failed to fetch royalty report'
    };
  }
}
