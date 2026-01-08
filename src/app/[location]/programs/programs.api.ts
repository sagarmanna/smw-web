/**
 * Programs API and data types
 * TEMPORARY: Using mock data due to API issues
 */

import { createCrudApi, StandardListResponse, StandardCrudResponse, StandardDeleteResponse, FETCH_ALL_LIMIT } from "@/utils/api/createCrudApi";
import { sortPrograms, paginatePrograms, filterProgramsByStatus, SortField } from "./utils/programsUtils";

export interface ProgramRow {
  id: number;
  name: string;
  ratePerHour?: number;
  ratePerCourse?: number;
  type: "PRIVATE" | "GROUP";
  isActive?: boolean;
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

// TEMPORARY: Mock data
const MOCK_PRIVATE_PROGRAMS: ProgramRow[] = [
  { id: 1, name: "40th Anniversary Piano", ratePerHour: 20.00, type: "PRIVATE", isActive: true },
  { id: 2, name: "Bass Guitar", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 3, name: "Cello", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 4, name: "Clarinet", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 5, name: "Classical Guitar", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 6, name: "Drums Contemporary", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 7, name: "Drums Core", ratePerHour: 65.00, type: "PRIVATE", isActive: false },
  { id: 8, name: "Drums Hybrid", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 9, name: "Flute", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 10, name: "Guitar Contemporary", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 11, name: "Piano", ratePerHour: 65.00, type: "PRIVATE", isActive: false },
  { id: 12, name: "Violin", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 13, name: "Viola", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
  { id: 14, name: "Saxophone", ratePerHour: 65.00, type: "PRIVATE", isActive: false },
  { id: 15, name: "Trumpet", ratePerHour: 65.00, type: "PRIVATE", isActive: true },
];

const MOCK_GROUP_PROGRAMS: ProgramRow[] = [
  { id: 101, name: "Band", ratePerCourse: 450.00, type: "GROUP", isActive: true },
  { id: 102, name: "Band (Full Year)", ratePerCourse: 900.00, type: "GROUP", isActive: true },
  { id: 103, name: "Level 1", ratePerCourse: 400.00, type: "GROUP", isActive: true },
  { id: 104, name: "Level 2", ratePerCourse: 400.00, type: "GROUP", isActive: true },
  { id: 105, name: "Level 3", ratePerCourse: 400.00, type: "GROUP", isActive: false },
  { id: 106, name: "Level 4", ratePerCourse: 400.00, type: "GROUP", isActive: true },
  { id: 107, name: "Level 5 Theory", ratePerCourse: 575.00, type: "GROUP", isActive: true },
  { id: 108, name: "Level 5 Theory Fall Crash Course", ratePerCourse: 385.00, type: "GROUP", isActive: false },
  { id: 109, name: "Level 5 Theory Summer Crash Course", ratePerCourse: 385.00, type: "GROUP", isActive: true },
  { id: 110, name: "Level 6 Theory", ratePerCourse: 575.00, type: "GROUP", isActive: true },
  { id: 111, name: "Level 6 Theory Summer Crash Course", ratePerCourse: 395.00, type: "GROUP", isActive: true },
  { id: 112, name: "Level 7 Theory", ratePerCourse: 600.00, type: "GROUP", isActive: false },
  { id: 113, name: "Level 8 Theory", ratePerCourse: 600.00, type: "GROUP", isActive: true },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ProgramsListResponse = StandardListResponse<ProgramRow>;
export type CreateProgramResponse = StandardCrudResponse<{
  id: number;
  name: string;
  ratePerHour?: number;
  ratePerCourse?: number;
  type: "PRIVATE" | "GROUP";
  createdOn?: string;
  createdByUserId?: number;
}>;
export type UpdateProgramResponse = StandardCrudResponse<{
  id: number;
  name: string;
  ratePerHour?: number;
  ratePerCourse?: number;
  type: "PRIVATE" | "GROUP";
  updatedOn?: string;
  updatedByUserId?: number;
}>;
export type DeleteProgramResponse = StandardDeleteResponse;

export interface CreateProgramRequest {
  name: string;
  ratePerHour?: number;
  ratePerCourse?: number;
  type: "PRIVATE" | "GROUP";
  isActive?: boolean;
}

export interface UpdateProgramRequest {
  id: number;
  name: string;
  ratePerHour?: number;
  ratePerCourse?: number;
  type: "PRIVATE" | "GROUP";
  isActive?: boolean;
}

// Create CRUD API functions using the factory
const programsApi = createCrudApi<ProgramRow, ProgramsQuery, CreateProgramRequest, UpdateProgramRequest>({
  endpoint: (_location) => `/admin/v2/programs/list`, // Static endpoint, location not used in path
  entityName: "program",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.type) params.type = query.type;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;
    if (query.showAll !== undefined) params.showAll = query.showAll;
    if (query.showActive !== undefined) params.showActive = query.showActive;
    if (query.showInActive !== undefined) params.showInActive = query.showInActive;
    return params;
  },
});

// TEMPORARY: Mock implementation
const getMockPrograms = async (query: ProgramsQuery): Promise<ProgramsListResponse> => {
  // Simulate API delay
  await delay(300);

  // Get all programs based on type
  const allPrograms = query.type === "GROUP" ? MOCK_GROUP_PROGRAMS : MOCK_PRIVATE_PROGRAMS;
  let filteredPrograms = allPrograms;

  // Filter by active/inactive status
  filteredPrograms = filterProgramsByStatus(
    filteredPrograms,
    query.showActive,
    query.showInActive
  );

  // Apply sorting
  const sortBy = (query.sortBy || "name") as SortField;
  const sortOrder = (query.sortOrder?.toLowerCase() || "asc") as "asc" | "desc";
  const sortedPrograms = sortPrograms(filteredPrograms, sortBy, sortOrder);

  // Apply pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const { paginatedData, total, totalPages } = paginatePrograms(sortedPrograms, page, limit);

  return {
    success: true,
    message: "Programs fetched successfully",
    data: {
      body: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  };
};

// Export typed functions
export const getPrograms = async (location: string, query: ProgramsQuery): Promise<ProgramsListResponse | null> => {
  // TEMPORARY: Return mock data instead of real API call
  try {
    return await getMockPrograms(query);
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch programs",
      data: {
        body: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 20,
          total: 0,
          totalPages: 0,
        },
      },
    };
  }
  
  // Original API call (commented out temporarily)
  // return programsApi.getList(location, query) as Promise<ProgramsListResponse | null>;
};

export const createProgram = async (location: string, payload: CreateProgramRequest): Promise<CreateProgramResponse> => {
  return programsApi.create(location, payload) as Promise<CreateProgramResponse>;
};

export const updateProgram = async (location: string, payload: UpdateProgramRequest): Promise<UpdateProgramResponse> => {
  return programsApi.update(location, payload) as Promise<UpdateProgramResponse>;
};

export const deleteProgram = async (location: string, id: number): Promise<DeleteProgramResponse> => {
  return programsApi.delete(location, id) as Promise<DeleteProgramResponse>;
};

