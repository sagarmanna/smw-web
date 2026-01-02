/**
 * Cities API and data types
 */

import { apiClient } from "@/lib/api/client";

export interface CityRow {
  id: number;
  name: string;
  province: string;
  provinceId?: number;
}

export interface CitiesQuery {
  page?: number;
  limit?: number;
  name?: string;
  province?: string;
}

export interface CitiesListResponse {
  success: boolean;
  message: string;
  data: {
    body: CityRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Helper function to extract error message from API error response
 */
function extractErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
  };
  const rawMsg = apiError.response?.data?.message;
  return Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg || "";
}

/**
 * Get cities list from API
 */
export async function getCities(location: string, query: CitiesQuery): Promise<CitiesListResponse | null> {
  try {
    void location; // kept for future API call signature parity

    const params: Record<string, unknown> = {};
    
    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.name) params.name = query.name;
    if (query.province) params.province = query.province;
    // IMPORTANT: backend rejects unknown query keys (400 BAD_REQUEST)
    // Do NOT send sort/order until API explicitly supports them for this endpoint.

    const response = await apiClient.get<CitiesListResponse>("/admin/v2/training-location/cities", {
      params,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    return {
      success: false,
      message: response.data?.message || "Failed to fetch cities",
      data: {
        body: [],
        pagination: emptyPagination,
      },
    };
  } catch (error) {
    const apiError = error as {
      response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch cities",
      data: {
        body: [],
        pagination: emptyPagination,
      },
    };
  }
}

export interface CreateCityRequest {
  name: string;
  provinceId: number;
}

export interface CreateCityResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    provinceId: number;
    createdOn?: string;
    createdByUserId?: number;
  };
  message: string;
}

/**
 * Create a new city
 *
 * Expected response shape (example):
 * {
 *   "success": true,
 *   "data": { "id": 110, "name": "Hyderabad", "provinceId": 1, "createdOn": "Jan 02, 2026", "createdByUserId": 694 },
 *   "message": "City created successfully"
 * }
 */
export async function createCity(location: string, payload: CreateCityRequest): Promise<CreateCityResponse> {
  try {
    void location; // kept for future API call signature parity

    const response = await apiClient.post<CreateCityResponse>("/admin/v2/training-location/cities", payload);

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to create city",
    };
  }
}

export interface UpdateCityRequest {
  id: number;
  name: string;
  provinceId: number;
}

export interface UpdateCityResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    provinceId: number;
    updatedOn?: string;
    updatedByUserId?: number;
  };
  message: string;
}

/**
 * Update an existing city
 *
 * Endpoint: PUT /admin/v2/training-location/cities/:id
 */
export async function updateCity(location: string, payload: UpdateCityRequest): Promise<UpdateCityResponse> {
  try {
    void location; // kept for future API call signature parity

    const url = `/admin/v2/training-location/cities/${payload.id}`;
    const body = { name: payload.name, provinceId: payload.provinceId };

    const response = await apiClient.put<UpdateCityResponse>(url, body);

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to update city",
    };
  }
}

export interface DeleteCityResponse {
  success: boolean;
  message: string;
  data?: { id?: number; deleted?: boolean };
}

/**
 * Delete a city
 *
 * Endpoint: DELETE /admin/v2/training-location/cities/:id
 */
export async function deleteCity(location: string, id: number): Promise<DeleteCityResponse> {
  try {
    void location; // kept for future API call signature parity

    const url = `/admin/v2/training-location/cities/${id}`;

    const response = await apiClient.delete<DeleteCityResponse>(url);

    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
    };
    const msg = extractErrorMessage(error);
    return {
      success: false,
      message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to delete city",
    };
  }
}
