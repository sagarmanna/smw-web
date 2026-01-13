/**
 * Referral Source API and data types
 */

import { apiClient } from "@/lib/api/client";
import {
  StandardCrudResponse,
  StandardDeleteResponse,
  extractErrorMessage,
} from "@/utils/api/createCrudApi";

export interface ReferralSourceRow {
  id: number;
  name: string;
}

export interface ReferralSourceQuery {
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Builds query parameters for referral sources API
 * Only includes sort/order when sort is specified
 * 
 * @param query - Optional query parameters for sorting
 * @returns Record of query parameters to send to API
 */
function buildReferralSourceQueryParams(query?: ReferralSourceQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  if (query?.sort) {
    params.sort = query.sort;
    if (query.order) {
      params.order = query.order;
    }
  }
  
  return params;
}

/**
 * Response structure for referral source list API
 * Note: This API returns a flat array instead of paginated structure
 */
export interface ReferralSourceListResponse {
  success: boolean;
  data: ReferralSourceRow[];
  message?: string;
}

export interface CreateReferralSourceRequest {
  name: string;
}

export interface UpdateReferralSourceRequest {
  id: number;
  name: string;
}

/**
 * Get all referral sources
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param query - Optional query parameters for sorting
 * @returns Promise resolving to referral source list response
 */
export async function getReferralSources(
  _location: string,
  query?: ReferralSourceQuery
): Promise<ReferralSourceListResponse> {
  try {
    const params = buildReferralSourceQueryParams(query);

    const response = await apiClient.get<ReferralSourceListResponse>(
      "/admin/v2/referral-sources",
      { params }
    );

    if (response.data && response.data.success) {
      return response.data;
    }

    return {
      success: false,
      data: [],
      message: response.data?.message || "Failed to fetch referral sources",
    };
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      data: [],
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch referral sources",
    };
  }
}

/**
 * Create a new referral source
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param payload - Referral source data to create
 * @returns Promise resolving to create response with created referral source
 */
export async function createReferralSource(
  _location: string,
  payload: CreateReferralSourceRequest
): Promise<StandardCrudResponse<ReferralSourceRow & { createdByUserId?: number }>> {
  try {
    const response = await apiClient.post<StandardCrudResponse<ReferralSourceRow & { createdByUserId?: number }>>(
      "/admin/v2/referral-sources",
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
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to create referral source",
    };
  }
}

/**
 * Update an existing referral source
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param payload - Referral source data to update (includes id)
 * @returns Promise resolving to update response with updated referral source
 */
export async function updateReferralSource(
  _location: string,
  payload: UpdateReferralSourceRequest
): Promise<StandardCrudResponse<ReferralSourceRow & { updatedByUserId?: number }>> {
  try {
    const { id, ...body } = payload;
    const response = await apiClient.put<StandardCrudResponse<ReferralSourceRow & { updatedByUserId?: number }>>(
      `/admin/v2/referral-sources/${id}`,
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
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to update referral source",
    };
  }
}

/**
 * Delete a referral source
 * 
 * @param _location - Location parameter (not used in endpoint, kept for consistency)
 * @param id - ID of the referral source to delete
 * @returns Promise resolving to delete response
 */
export async function deleteReferralSource(
  _location: string,
  id: number
): Promise<StandardDeleteResponse> {
  try {
    const response = await apiClient.delete<StandardDeleteResponse>(
      `/admin/v2/referral-sources/${id}`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to delete referral source",
    };
  }
}
