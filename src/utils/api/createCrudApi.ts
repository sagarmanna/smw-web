/**
 * Generic CRUD API factory
 * Creates standardized GET, POST, PUT, DELETE functions for listing features
 */

import { apiClient } from "@/lib/api/client";

export const FETCH_ALL_LIMIT = 99999;

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Helper function to extract error message from API error response
 */
export function extractErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
  };
  const rawMsg = apiError.response?.data?.message;
  return Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg || "";
}

/**
 * Standard list response structure
 */
export interface StandardListResponse<TData> {
  success: boolean;
  message: string;
  data: {
    body: TData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Standard create/update response structure
 */
export interface StandardCrudResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  message: string;
}

/**
 * Standard delete response structure
 */
export interface StandardDeleteResponse {
  success: boolean;
  message: string;
  data?: { id?: number; deleted?: boolean };
}

/**
 * Configuration for creating CRUD API functions
 */
export interface CrudApiConfig<TRow, TQuery, TCreateRequest, TUpdateRequest> {
  /**
   * Base endpoint - can be a static string or a function that builds it from location
   * Examples:
   * - Static: "/admin/v2/training-location/cities"
   * - Dynamic: (location) => `/admin/v2/${location}/cities`
   */
  endpoint: string | ((location: string) => string);

  /**
   * Entity name for error messages (e.g., "city", "province")
   */
  entityName: string;

  /**
   * Function to build query params from query object
   * Should handle pagination, filtering, and convert limit=-1 to FETCH_ALL_LIMIT
   */
  buildQueryParams: (query: TQuery) => Record<string, unknown>;
}

/**
 * Creates CRUD API functions for a listing feature
 */
export function createCrudApi<TRow, TQuery, TCreateRequest, TUpdateRequest extends { id: number }>(
  config: CrudApiConfig<TRow, TQuery, TCreateRequest, TUpdateRequest>
) {
  const { endpoint, entityName, buildQueryParams } = config;

  /**
   * Helper to get the endpoint URL (static or dynamic)
   */
  const getEndpoint = (location: string): string => {
    return typeof endpoint === "function" ? endpoint(location) : endpoint;
  };

  /**
   * Get list of entities
   */
  async function getList(location: string, query: TQuery): Promise<StandardListResponse<TRow> | null> {
    try {
      const params = buildQueryParams(query);
      const endpointUrl = getEndpoint(location);

      const response = await apiClient.get<StandardListResponse<TRow>>(endpointUrl, {
        params,
      });

      if (response.data && response.data.success) {
        return response.data;
      }

      return {
        success: false,
        message: response.data?.message || `Failed to fetch ${entityName}s`,
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
        message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || `Failed to fetch ${entityName}s`,
        data: {
          body: [],
          pagination: emptyPagination,
        },
      };
    }
  }

  /**
   * Create a new entity
   */
  async function create(location: string, payload: TCreateRequest): Promise<StandardCrudResponse> {
    try {
      const endpointUrl = getEndpoint(location);

      const response = await apiClient.post<StandardCrudResponse>(endpointUrl, payload);

      return response.data;
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
      };
      const msg = extractErrorMessage(error);
      return {
        success: false,
        message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || `Failed to create ${entityName}`,
      };
    }
  }

  /**
   * Update an existing entity
   */
  async function update(location: string, payload: TUpdateRequest): Promise<StandardCrudResponse> {
    try {
      const endpointUrl = getEndpoint(location);
      const url = `${endpointUrl}/${payload.id}`;
      // Extract id from payload for body
      const { id, ...body } = payload as TUpdateRequest & Record<string, unknown>;

      const response = await apiClient.put<StandardCrudResponse>(url, body);

      return response.data;
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
      };
      const msg = extractErrorMessage(error);
      return {
        success: false,
        message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || `Failed to update ${entityName}`,
      };
    }
  }

  /**
   * Delete an entity
   */
  async function deleteEntity(location: string, id: number): Promise<StandardDeleteResponse> {
    try {
      const endpointUrl = getEndpoint(location);
      const url = `${endpointUrl}/${id}`;

      const response = await apiClient.delete<StandardDeleteResponse>(url);

      return response.data;
    } catch (error: unknown) {
      const apiError = error as {
        response?: { status?: number; statusText?: string; data?: { message?: string | string[]; errorCode?: string } };
      };
      const msg = extractErrorMessage(error);
      return {
        success: false,
        message: msg || `${apiError.response?.status}: ${apiError.response?.statusText}` || `Failed to delete ${entityName}`,
      };
    }
  }

  return {
    getList,
    create,
    update,
    delete: deleteEntity,
    FETCH_ALL_LIMIT,
  };
}

