// import { apiClient } from "@/lib/api/client"; // Uncomment when API is ready

import { generateOwnerHistory } from "../mockData/ownerDetailMockData";

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
 * Fetches history data for an owner
 * Endpoint: GET /admin/v2/{location}/user/{ownerId}/history
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function getOwnerHistory(
  location: string,
  ownerId: number
): Promise<HistoryApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning

    // Generate mock history data
    const historyData = generateOwnerHistory(ownerId);

    const mockHistory: HistoryApiResponse = {
      success: true,
      message: "History fetched successfully",
      data: {
        body: historyData,
        pagination: {
          page: 1,
          limit: 20,
          total: historyData.length,
          totalPages: 1,
        },
      },
    };

    return mockHistory;

    // Uncomment when API is ready:
    // const url = `/admin/v2/${location}/user/${ownerId}/history`;
    // const response = await apiClient.get<HistoryApiResponse>(url);
    // return response.data;
  } catch (error: unknown) {
    console.error("Error fetching owner history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch owner history"
    );
    return null;
  }
}

