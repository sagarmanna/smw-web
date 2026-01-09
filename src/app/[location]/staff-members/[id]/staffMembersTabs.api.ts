import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface StaffMemberHistoryItem {
  id: number;
  message: string;
  createdOn: string;
}

interface HistoryApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HistoryApiResponse {
  success: boolean;
  data: {
    body: StaffMemberHistoryItem[];
    pagination: HistoryApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// History API
// ---------------------------------------------

/**
 * Fetches history data for a staff member
 * Endpoint: GET /admin/v2/{location}/history?type=user&id={staffMemberId}
 * Example: /admin/v2/training-location/history?type=user&id=11455
 *
 * @param location - The location identifier
 * @param staffMemberId - The staff member user ID
 * @returns Promise resolving to the history response or null on error
 */
export async function getStaffMemberHistory(
  location: string,
  staffMemberId: number
): Promise<HistoryApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/history`;
    const params = new URLSearchParams({
      type: 'user',
      id: staffMemberId.toString(),
    });
    
    const response = await apiClient.get<HistoryApiResponse>(
      `${url}?${params.toString()}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching staff member history:", error);
    return null;
  }
}

