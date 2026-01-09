/**
 * Owners API and data types
 * Handles server-side fetching of owners with pagination, sorting, and filtering
 */

import { apiClient } from '@/lib/api/client';
import { FETCH_ALL_LIMIT } from '@/utils/api/createCrudApi';

/**
 * Owner data row structure from API response
 */
export interface OwnerRow {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

/**
 * Query parameters for fetching owners list
 * All parameters are optional for flexible filtering
 */
export interface OwnersQuery {
  /** Page number for pagination (1-indexed) */
  page?: number;
  /** Number of items per page. Use -1 to fetch all records */
  limit?: number;
  /** Filter by first name (partial match) */
  firstName?: string;
  /** Filter by last name (partial match) */
  lastName?: string;
  /** Filter by email address (partial match) */
  email?: string;
  /** Sort field */
  sort?: "firstName" | "lastName" | "email";
  /** Sort direction */
  order?: "asc" | "desc";
  /** Show only active owners */
  showActive?: boolean;
  /** Show only inactive owners */
  showInActive?: boolean;
}

/**
 * API response structure for owners list
 */
export interface OwnersListResponse {
  success: boolean;
  message: string;
  data: {
    body: OwnerRow[];
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
 * Helper to create empty response - DRY principle
 */
const createEmptyOwnersResponse = (): OwnersListResponse => ({
  success: false,
  message: "Failed to fetch owners",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Builds URL search parameters from query object
 * Filters out empty values and converts -1 limit to FETCH_ALL_LIMIT
 * @param query - Query parameters object
 * @returns URLSearchParams ready for API call
 */
const buildOwnersQueryParams = (query: OwnersQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    // Convert -1 (UI "All" option) to FETCH_ALL_LIMIT for API
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  // Only append non-empty, trimmed filter values to avoid unnecessary params
  if (query.firstName?.trim()) params.append("firstName", query.firstName.trim());
  if (query.lastName?.trim()) params.append("lastName", query.lastName.trim());
  if (query.email?.trim()) params.append("email", query.email.trim());
  if (query.showActive !== undefined) {
    params.append("showActive", query.showActive.toString());
  }
  if (query.showInActive !== undefined) {
    params.append("showInActive", query.showInActive.toString());
  }
  if (query.sort) {
    params.append("sort", query.sort);
    // Always include order when sort is provided
    // Use explicit order if provided, otherwise default to 'asc'
    const orderValue = query.order && query.order.trim() !== "" ? query.order : "asc";
    params.append("order", orderValue);
  }

  return params;
};

/**
 * Fetches owners list from the API with server-side pagination, sorting, and filtering
 * 
 * @param location - The location slug for the API endpoint
 * @param query - Query parameters including pagination, filters, and sorting options
 * @returns Promise resolving to OwnersListResponse on success, or structured error response on failure
 * 
 * @example
 * ```typescript
 * const response = await getOwners('maple', {
 *   page: 1,
 *   limit: 20,
 *   sort: 'lastName',
 *   order: 'asc',
 *   showActive: true
 * });
 * ```
 */
export async function getOwners(
  location: string,
  query: OwnersQuery
): Promise<OwnersListResponse> {
  try {
    const params = buildOwnersQueryParams(query);

    const response = await apiClient.get<OwnersListResponse>(
      `/admin/v2/${location}/user/list/owner`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching owners:", error);
    const emptyResponse = createEmptyOwnersResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch owners";
    return emptyResponse;
  }
}

