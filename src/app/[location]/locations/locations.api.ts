/**
 * Locations API and data types
 * Uses the new v2 admin list endpoint:
 * GET /admin/v2/locations/list?page=1&limit=10&sort=name&order=ASC
 */

import { apiClient } from "@/lib/api/client";
import { FETCH_ALL_LIMIT, StandardListResponse } from "@/utils/api/createCrudApi";

/**
 * Location row structure (best-effort, based on UI needs).
 * Extra fields from API are ignored by the table.
 */
export interface LocationRow {
  id: number;
  name: string;
  address?: string;
  email?: string;
  slug?: string;
}

export interface LocationsQuery {
  page?: number;
  limit?: number;
  name?: string;
  address?: string;
  email?: string;
  sort?: "name" | "address" | "email";
  order?: "ASC" | "DESC";
}

export type LocationsListResponse = StandardListResponse<LocationRow>;

export interface LocationDetails {
  id?: number;
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  hstRegistrationNo?: string;
  royaltyPercent?: number;
  advertisementPercent?: number;
  conversionDate?: string;
}

export interface LocationDetailsResponse {
  success: boolean;
  message?: string;
  data: LocationDetails;
}

const emptyResponse: LocationsListResponse = {
  success: false,
  message: "Failed to fetch locations",
  data: {
    body: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
};

const buildLocationsQueryParams = (query: LocationsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page !== undefined) params.append("page", String(query.page));
  if (query.limit !== undefined) {
    params.append("limit", String(query.limit === -1 ? FETCH_ALL_LIMIT : query.limit));
  }

  if (query.name?.trim()) params.append("name", query.name.trim());
  if (query.address?.trim()) params.append("address", query.address.trim());
  if (query.email?.trim()) params.append("email", query.email.trim());

  // Backend expects sort/order (defaults match requested example).
  params.append("sort", query.sort || "name");
  params.append("order", query.order || "ASC");

  return params;
};

export async function getLocations(
  _location: string,
  query: LocationsQuery
): Promise<LocationsListResponse> {
  try {
    const params = buildLocationsQueryParams(query);
    const response = await apiClient.get<LocationsListResponse>(
      "/admin/v2/locations/list",
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      ...emptyResponse,
      message: apiError.response?.data?.message || emptyResponse.message,
    };
  }
}

