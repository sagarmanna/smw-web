/**
 * Holidays API and data types
 */

import { apiClient } from "@/lib/api/client";
import {
  StandardCrudResponse,
  StandardDeleteResponse,
  extractErrorMessage,
} from "@/utils/api/createCrudApi";
import { format, parse } from "date-fns";

export interface HolidayRow {
  id: number;
  date: string; // Display format: "Dec 25, 2017"
  description: string;
}

export interface HolidayQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Response structure for paginated holidays list API
 */
export interface HolidayListResponse {
  success: boolean;
  data: {
    body: HolidayRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface CreateHolidayRequest {
  date: string; // ISO format: "YYYY-MM-DD"
  description: string;
}

export interface UpdateHolidayRequest {
  id: number;
  date: string; // ISO format: "YYYY-MM-DD"
  description: string;
}

/**
 * Builds query parameters for holidays API
 * 
 * @param query - Optional query parameters for pagination and sorting
 * @returns Record of query parameters to send to API
 */
function buildHolidayQueryParams(query?: HolidayQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  if (query?.page !== undefined) {
    params.page = query.page;
  }
  
  if (query?.limit !== undefined) {
    params.limit = query.limit;
  }
  
  if (query?.sort) {
    params.sort = query.sort;
    if (query.order) {
      params.order = query.order;
    }
  }
  
  return params;
}

/**
 * Converts display date format (MMM dd, yyyy) to ISO format (YYYY-MM-DD)
 * 
 * @param displayDate - Date string in display format (e.g., "Dec 25, 2017")
 * @returns ISO format date string (e.g., "2017-12-25")
 */
export function convertDisplayDateToISO(displayDate: string): string {
  try {
    // Parse display format: "Dec 25, 2017"
    const date = parse(displayDate, "MMM dd, yyyy", new Date());
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }
    // Convert to ISO format: "YYYY-MM-DD"
    return format(date, "yyyy-MM-dd");
  } catch {
    // If parsing fails, try to parse as ISO format directly
    try {
      const date = new Date(displayDate);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return format(date, "yyyy-MM-dd");
    } catch {
      return displayDate; // Return as-is if all parsing fails
    }
  }
}

/**
 * Converts ISO date format (YYYY-MM-DD) to display format (MMM dd, yyyy)
 * 
 * @param isoDate - Date string in ISO format (e.g., "2017-12-25")
 * @returns Display format date string (e.g., "Dec 25, 2017")
 */
export function convertISODateToDisplay(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate;
    }
    return format(date, "MMM dd, yyyy");
  } catch {
    return isoDate;
  }
}

/**
 * Get paginated holidays list
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param query - Optional query parameters for pagination and sorting
 * @returns Promise resolving to paginated holidays list response
 */
export async function getHolidays(
  _location: string,
  query?: HolidayQuery
): Promise<HolidayListResponse> {
  try {
    const params = buildHolidayQueryParams(query);

    const response = await apiClient.get<HolidayListResponse>(
      "/admin/v2/holidays",
      { params }
    );

    if (response.data && response.data.success) {
      return response.data;
    }

    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: query?.page || 1,
          limit: query?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      },
      message: response.data?.message || "Failed to fetch holidays",
    };
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: query?.page || 1,
          limit: query?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      },
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch holidays",
    };
  }
}

/**
 * Create a new holiday
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param payload - Holiday data to create (date in ISO format)
 * @returns Promise resolving to create response with created holiday
 */
export async function createHoliday(
  _location: string,
  payload: CreateHolidayRequest
): Promise<StandardCrudResponse<HolidayRow & { createdByUserId?: number }>> {
  try {
    const response = await apiClient.post<StandardCrudResponse<HolidayRow & { createdByUserId?: number }>>(
      "/admin/v2/holidays",
      payload
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to create holiday",
    };
  }
}

/**
 * Update an existing holiday
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param payload - Holiday data to update (includes id, date in ISO format)
 * @returns Promise resolving to update response with updated holiday
 */
export async function updateHoliday(
  _location: string,
  payload: UpdateHolidayRequest
): Promise<StandardCrudResponse<HolidayRow & { updatedByUserId?: number }>> {
  try {
    const { id, ...body } = payload;
    const response = await apiClient.put<StandardCrudResponse<HolidayRow & { updatedByUserId?: number }>>(
      `/admin/v2/holidays/${id}`,
      body
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to update holiday",
    };
  }
}

/**
 * Delete a holiday
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param id - ID of the holiday to delete
 * @returns Promise resolving to delete response
 */
export async function deleteHoliday(
  _location: string,
  id: number
): Promise<StandardDeleteResponse> {
  try {
    const response = await apiClient.delete<StandardDeleteResponse>(
      `/admin/v2/holidays/${id}`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to delete holiday",
    };
  }
}
