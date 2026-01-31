/**
 * Programs API and data types
 */

import { createCrudApi, StandardListResponse, StandardCrudResponse, StandardDeleteResponse, FETCH_ALL_LIMIT } from "@/utils/api/createCrudApi";
import { apiClient } from "@/lib/api/client";
import { extractErrorMessage } from "@/utils/api/createCrudApi";

/**
 * Programs row structure - matches API response structure directly
 * Example:
 * { "id": 110, "name": "40th Anniversary Piano", "rate": "20.00", "status": 1, "type": 1 }
 */
export interface ProgramRow {
  id: number;
  name: string;
  rate: string;
  status: number;
  type: number;
  createdByUserId?: number;
  updatedByUserId?: number;
  createdOn?: string;
  updatedOn?: string;
}

export interface ProgramsQuery {
  page?: number;
  limit?: number;
  type?: "PRIVATE" | "GROUP";
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  showAll?: boolean;
  showActive?: boolean;
  showInActive?: boolean;
}

export type ProgramsListResponse = StandardListResponse<ProgramRow>;
export type CreateProgramResponse = StandardCrudResponse<ProgramRow>;
export type UpdateProgramResponse = StandardCrudResponse<ProgramRow>;
export type DeleteProgramResponse = StandardDeleteResponse;

export interface CreateProgramRequest {
  name: string;
  rate: number;
  status: number; // 1 = active, 0 = inactive
  type: number; // 1 = PRIVATE, 2 = GROUP
}

export interface UpdateProgramRequest {
  id: number;
  name: string;
  rate: number;
  status: number; // 1 = active, 0 = inactive
  type: number; // 1 = PRIVATE, 2 = GROUP
}

// Create CRUD API functions using the factory
const programsApi = createCrudApi<ProgramRow, ProgramsQuery, CreateProgramRequest, UpdateProgramRequest>({
  // GET: /admin/v2/programs?page=1&limit=10&type=PRIVATE&sortBy=name&sortOrder=ASC&showAll=false&showInActive=true&showActive=false
  // Location is not used in this endpoint path.
  endpoint: (_location) => `/admin/v2/programs`,
  entityName: "program",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.type) params.type = query.type;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;

    // Server-side filter flags (legacy behavior):
    // Default to showActive=true, showInActive=false, showAll=false
    // Only set showAll=true when explicitly requested
    const showActive = query.showActive ?? true;
    const showInActive = query.showInActive ?? false;
    const showAll = query.showAll ?? false;

    params.showActive = showActive;
    params.showInActive = showInActive;
    params.showAll = showAll;

    return params;
  },
});

// Export typed functions
export const getPrograms = async (location: string, query: ProgramsQuery): Promise<ProgramsListResponse | null> => {
  return programsApi.getList(location, query) as Promise<ProgramsListResponse | null>;
};

export const createProgram = async (location: string, payload: CreateProgramRequest): Promise<CreateProgramResponse> => {
  // Backend expects: POST /admin/v2/programs/{type}
  // Example: POST /admin/v2/programs/1
  try {
    const { type, ...body } = payload as CreateProgramRequest & Record<string, unknown>;
    const url = `/admin/v2/programs/${type}`;
    const response = await apiClient.post<CreateProgramResponse>(url, body);
    return response.data;
  } catch (error: unknown) {
    const msg = extractErrorMessage(error, "Failed to create program");
    return {
      success: false,
      message: msg,
    };
  }
};

export const updateProgram = async (location: string, payload: UpdateProgramRequest): Promise<UpdateProgramResponse> => {
  return programsApi.update(location, payload) as Promise<UpdateProgramResponse>;
};

export const deleteProgram = async (location: string, id: number): Promise<DeleteProgramResponse> => {
  return programsApi.delete(location, id) as Promise<DeleteProgramResponse>;
};

