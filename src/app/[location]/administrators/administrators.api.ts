/**
 * Administrators API and data types
 */

import { 
  sortAdministrators, 
  applyActiveFilter, 
  applyTextFilter, 
  applyPagination 
} from "./utils/sortAdministrators";
import { mockAdministratorData } from "./mockData/administratorMockData";

export interface AdministratorRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface AdministratorsQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  sort?: "firstName" | "lastName" | "email";
  order?: "asc" | "desc";
  showActive?: boolean;
  showInActive?: boolean;
}

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

// TODO: Add CreateAdministratorRequest and CreateAdministratorResponse interfaces when API is ready
// export interface CreateAdministratorRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
// }
//
// export interface CreateAdministratorResponse {
//   success: boolean;
//   message: string;
//   data: AdministratorRow;
// }

// TODO: Implement createAdministrator function when API is ready
// export async function createAdministrator(
//   location: string,
//   payload: CreateAdministratorRequest
// ): Promise<CreateAdministratorResponse> {
//   // API implementation will go here
// }

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Get administrators list (currently using mock data)
 * This will be replaced with actual API call when backend is ready
 */
export async function getAdministrators(
  location: string,
  query: AdministratorsQuery
): Promise<AdministratorsListResponse | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Start with all administrators
    let filteredData = mockAdministratorData;
    
    // Apply active/inactive filter
    filteredData = applyActiveFilter(
      filteredData,
      query.showActive,
      query.showInActive
    );
    
    // Apply column filters
    filteredData = applyTextFilter(filteredData, 'firstName', query.firstName);
    filteredData = applyTextFilter(filteredData, 'lastName', query.lastName);
    filteredData = applyTextFilter(filteredData, 'email', query.email);
    
    // Apply sorting
    if (query.sort) {
      filteredData = sortAdministrators(
        filteredData,
        query.sort,
        query.order || 'asc'
      );
    }
    
    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const { paginatedData, total, totalPages } = applyPagination(
      filteredData,
      page,
      limit
    );
    
    return {
      success: true,
      message: 'Administrators fetched successfully',
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
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return {
      success: false,
      message: "Failed to fetch administrators",
      data: {
        body: [],
        pagination: emptyPagination,
      },
    };
  }
}