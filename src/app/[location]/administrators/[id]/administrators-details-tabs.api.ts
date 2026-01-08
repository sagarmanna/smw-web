import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface AdministratorHistoryItem {
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
    body: AdministratorHistoryItem[];
    pagination: HistoryApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// History API
// ---------------------------------------------

/**
 * Fetches history data for an administrator
 * Endpoint: GET /admin/v2/{location}/history?type=user&id={administratorId}
 * Example: /admin/v2/training-location/history?type=user&id=1373
 *
 * @param location - The location identifier
 * @param administratorId - The administrator user ID
 * @returns Promise resolving to the history response or null on error
 */
export async function getAdministratorHistory(
  location: string,
  administratorId: number
): Promise<HistoryApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/history`;
    const params = new URLSearchParams({
      type: 'user',
      id: administratorId.toString(),
    });
    
    const response = await apiClient.get<HistoryApiResponse>(
      `${url}?${params.toString()}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching administrator history:", error);
    return null;
  }
}


