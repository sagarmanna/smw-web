/**
 * Staff Members API and data types
 * Handles server-side fetching of staff members with pagination, sorting, and filtering
 */

import { apiClient } from '@/lib/api/client';
import { FETCH_ALL_LIMIT } from '@/utils/api/createCrudApi';

/**
 * Staff Member data row structure from API response
 */
export interface StaffMemberRow {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

/**
 * Query parameters for fetching staff members list
 * All parameters are optional for flexible filtering
 */
export interface StaffMembersQuery {
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
  /** Show only active staff members */
  showActive?: boolean;
  /** Show only inactive staff members */
  showInActive?: boolean;
}

/**
 * API response structure for staff members list
 */
export interface StaffMembersListResponse {
  success: boolean;
  message: string;
  data: {
    body: StaffMemberRow[];
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
const buildStaffMembersQueryParams = (query: StaffMembersQuery): URLSearchParams => {
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
 * Fetches staff members list from the API with server-side pagination, sorting, and filtering
 * 
 * @param location - The location slug for the API endpoint
 * @param query - Query parameters including pagination, filters, and sorting options
 * @returns Promise resolving to StaffMembersListResponse on success, or null on error
 * 
 * @example
 * ```typescript
 * const response = await getStaffMembers('maple', {
 *   page: 1,
 *   limit: 20,
 *   sort: 'lastName',
 *   order: 'asc',
 *   showActive: true
 * });
 * ```
 */
export async function getStaffMembers(
  location: string,
  query: StaffMembersQuery
): Promise<StaffMembersListResponse | null> {
  try {
    const params = buildStaffMembersQueryParams(query);

    const response = await apiClient.get<StaffMembersListResponse>(
      `/admin/v2/${location}/user/list/staffmember`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching staff members:", error);
    // Return null on error - let Redux slice handle empty state and error display
    // This follows the pattern used in other listing APIs (administrators, teachers, etc.)
    return null;
  }
}

