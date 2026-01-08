/**
 * Administrators API and data types
 * Handles server-side fetching of administrators with pagination, sorting, and filtering
 */

import { apiClient } from '@/lib/api/client';
import { FETCH_ALL_LIMIT } from '@/utils/api/createCrudApi';

/**
 * Administrator data row structure from API response
 */
export interface AdministratorRow {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

/**
 * Query parameters for fetching administrators list
 * All parameters are optional for flexible filtering
 */
export interface AdministratorsQuery {
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
  /** Show only active administrators */
  showActive?: boolean;
  /** Show only inactive administrators */
  showInActive?: boolean;
}

/**
 * API response structure for administrators list
 */
export interface AdministratorsListResponse {
  success: boolean;
  message: string;
  data: {
    body: AdministratorRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Builds URL search parameters from query object
 * Filters out empty values and converts -1 limit to FETCH_ALL_LIMIT
 * @param query - Query parameters object
 * @returns URLSearchParams ready for API call
 */
const buildAdministratorsQueryParams = (query: AdministratorsQuery): URLSearchParams => {
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
  if (query.sort) params.append("sort", query.sort);
  if (query.order) params.append("order", query.order);

  return params;
};

/**
 * Fetches administrators list from the API with server-side pagination, sorting, and filtering
 * 
 * @param location - The location slug for the API endpoint
 * @param query - Query parameters including pagination, filters, and sorting options
 * @returns Promise resolving to AdministratorsListResponse on success, or null on error
 * 
 * @example
 * ```typescript
 * const response = await getAdministrators('maple', {
 *   page: 1,
 *   limit: 20,
 *   sort: 'lastName',
 *   order: 'asc',
 *   showActive: true
 * });
 * ```
 */
export async function getAdministrators(
  location: string,
  query: AdministratorsQuery
): Promise<AdministratorsListResponse | null> {
  try {
    const params = buildAdministratorsQueryParams(query);

    const response = await apiClient.get<AdministratorsListResponse>(
      `/admin/v2/${location}/user/list/administrator`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching administrators:", error);
    // Return null on error - let Redux slice handle empty state and error display
    // This follows the pattern used in other listing APIs (teachers, students, etc.)
    return null;
  }
}