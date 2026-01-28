import { apiClient } from '@/lib/api/client';

/**
 * Timeline API types
 */

export interface TimelineRow {
  id: number;
  date: string; // ISO date string
  createdUser: string;
  message: string; // HTML string with invoice links
}

/**
 * Timeline query parameters for API requests
 */
export interface TimelineQuery {
  page?: number;
  limit?: number;
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
  createdUserId?: number;
  message?: string;
}

/**
 * API response structure for timeline data
 */
interface TimelineListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: TimelineRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Internal response structure for timeline listing
 */
export interface TimelineListResponse {
  success: boolean;
  message: string;
  data: {
    body: TimelineRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

/**
 * Helper to build query parameters
 */
const buildTimelineQueryParams = (query: TimelineQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);
  if (query.createdUserId) params.append("createdUserId", query.createdUserId.toString());
  if (query.message) params.append("message", query.message);

  return params;
};

/**
 * Helper to create empty response
 */
const createEmptyTimelineResponse = (): TimelineListResponse => ({
  success: false,
  message: "Failed to fetch timeline",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Created user data structure
 */
export interface CreatedUser {
  id: number;
  publicIdentity: string;
}

/**
 * API response structure for created users list
 */
interface CreatedUsersApiResponse {
  success: boolean;
  data: CreatedUser[];
  message: string;
}

/**
 * Fetches the list of created users for the timeline dropdown
 * Endpoint: GET /admin/v2/{location}/timeline/created-users
 * 
 * @param location - The location identifier
 * @returns Promise resolving to array of created users or empty array on error
 */
export async function getTimelineCreatedUsers(
  location: string
): Promise<CreatedUser[]> {
  try {
    const response = await apiClient.get<CreatedUsersApiResponse>(
      `/admin/v2/${location}/timeline/created-users`
    );

    if (response.data.success) {
      return response.data.data;
    }

    return [];
  } catch (error: unknown) {
    console.error("Error fetching timeline created users:", error);
    return [];
  }
}

/**
 * Fetches timeline data from the API
 * Endpoint: GET /admin/v2/{location}/timeline
 * 
 * @param location - The location identifier
 * @param query - Query parameters for filtering and pagination
 * @returns Promise resolving to the timeline list response
 */
export async function getTimelineList(
  location: string,
  query: TimelineQuery
): Promise<TimelineListResponse> {
  try {
    const params = buildTimelineQueryParams(query);

    const response = await apiClient.get<TimelineListApiResponse>(
      `/admin/v2/${location}/timeline`,
      { params }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: response.data.data.body,
        pagination: response.data.data.pagination,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyTimelineResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch timeline";
    return emptyResponse;
  }
}

