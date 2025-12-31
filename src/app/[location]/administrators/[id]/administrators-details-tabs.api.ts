// import { apiClient } from "@/lib/api/client"; // Uncomment when API is ready

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
 * Endpoint: GET /admin/v2/{location}/user/{administratorId}/history
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function getAdministratorHistory(
  location: string,
  administratorId: number
): Promise<HistoryApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning
    void administratorId; // Suppress unused parameter warning

    // Mock history data
    const mockHistory: HistoryApiResponse = {
      success: true,
      message: "History fetched successfully",
      data: {
        body: [
          {
            id: 1,
            message: "Administrator account created",
            createdOn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          },
          {
            id: 2,
            message: "Profile updated",
            createdOn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          },
          {
            id: 3,
            message: "Email address added",
            createdOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
        },
      },
    };

    return mockHistory;

    // Uncomment when API is ready:
    // const url = `/admin/v2/${location}/user/${administratorId}/history`;
    // const response = await apiClient.get<HistoryApiResponse>(url);
    // return response.data;
  } catch (error: unknown) {
    console.error("Error fetching administrator history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch administrator history"
    );
    return null;
  }
}


