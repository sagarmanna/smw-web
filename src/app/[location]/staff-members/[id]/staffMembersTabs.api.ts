// import { apiClient } from "@/lib/api/client"; // Uncomment when API is ready

import { generateStaffMemberHistory } from "../mockData/staffMemberDetailMockData";

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
 * Endpoint: GET /admin/v2/{location}/user/{staffMemberId}/history
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function getStaffMemberHistory(
  location: string,
  staffMemberId: number
): Promise<HistoryApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning

    // Generate mock history data
    const historyData = generateStaffMemberHistory(staffMemberId);

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
    // const url = `/admin/v2/${location}/user/${staffMemberId}/history`;
    // const response = await apiClient.get<HistoryApiResponse>(url);
    // return response.data;
  } catch (error: unknown) {
    console.error("Error fetching staff member history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch staff member history"
    );
    return null;
  }
}

