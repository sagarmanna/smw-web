/**
 * Staff Members API and data types
 */

import { 
  sortByField, 
  applyActiveFilter, 
  applyTextFilter, 
  applyPagination 
} from "@/utils/listingUtils";
import { mockStaffMemberData } from "./mockData/staffMemberMockData";

export interface StaffMemberRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface StaffMembersQuery {
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

// TODO: Add CreateStaffMemberRequest and CreateStaffMemberResponse interfaces when API is ready
// export interface CreateStaffMemberRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
// }
//
// export interface CreateStaffMemberResponse {
//   success: boolean;
//   message: string;
//   data: StaffMemberRow;
// }

// TODO: Implement createStaffMember function when API is ready
// export async function createStaffMember(
//   location: string,
//   payload: CreateStaffMemberRequest
// ): Promise<CreateStaffMemberResponse> {
//   // API implementation will go here
// }

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Get staff members list (currently using mock data)
 * This will be replaced with actual API call when backend is ready
 */
export async function getStaffMembers(
  location: string,
  query: StaffMembersQuery
): Promise<StaffMembersListResponse | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Start with all staff members
    let filteredData = mockStaffMemberData;
    
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
      filteredData = sortByField(
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
      message: 'Staff members fetched successfully',
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
    console.error("Error fetching staff members:", error);
    return {
      success: false,
      message: "Failed to fetch staff members",
      data: {
        body: [],
        pagination: emptyPagination,
      },
    };
  }
}

