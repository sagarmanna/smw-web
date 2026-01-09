import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface OwnerHistoryItem {
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
    body: OwnerHistoryItem[];
    pagination: HistoryApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// History API
// ---------------------------------------------

/**
 * Helper to create empty history response - DRY principle
 */
const createEmptyHistoryResponse = (): HistoryApiResponse => ({
  success: false,
  message: "Failed to fetch owner history",
  data: {
    body: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
});

/**
 * Fetches history data for an owner with pagination
 * Endpoint: GET /admin/v2/{location}/history?type=user&id={ownerId}&page={page}
 * 
 * @param location - The location identifier
 * @param ownerId - The owner user ID
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to HistoryApiResponse (always returns structured response, never null)
 */
export async function getOwnerHistory(
  location: string,
  ownerId: number,
  page: number = 1
): Promise<HistoryApiResponse> {
  try {
    const response = await apiClient.get<HistoryApiResponse>(
      `/admin/v2/${location}/history`,
      {
        params: {
          type: 'user',
          id: ownerId,
          page,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching owner history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyHistoryResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch owner history";
    return emptyResponse;
  }
}

