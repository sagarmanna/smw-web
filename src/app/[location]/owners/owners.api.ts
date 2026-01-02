/**
 * Owners API and data types
 */

import { applyActiveFilter, applyPagination, applyTextFilter, sortByField } from "@/utils/listingUtils";
import { mockOwnerData } from "./mockData/ownerMockData";

export interface OwnerRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface OwnersQuery {
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

export interface OwnersListResponse {
  success: boolean;
  message: string;
  data: {
    body: OwnerRow[];
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
 * Get owners list (currently using mock data)
 * This will be replaced with actual API call when backend is ready
 */
export async function getOwners(location: string, query: OwnersQuery): Promise<OwnersListResponse | null> {
  try {
    void location; // kept for future API call signature parity

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filteredData = mockOwnerData;

    // Apply active/inactive filter
    filteredData = applyActiveFilter(filteredData, query.showActive, query.showInActive);

    // Apply column filters
    filteredData = applyTextFilter(filteredData, "firstName", query.firstName);
    filteredData = applyTextFilter(filteredData, "lastName", query.lastName);
    filteredData = applyTextFilter(filteredData, "email", query.email);

    // Apply sorting
    if (query.sort) {
      filteredData = sortByField(filteredData, query.sort, query.order || "asc");
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const { paginatedData, total, totalPages } = applyPagination(filteredData, page, limit);

    return {
      success: true,
      message: "Owners fetched successfully",
      data: {
        body: paginatedData,
        pagination: { page, limit, total, totalPages },
      },
    };
  } catch (error) {
    console.error("Error fetching owners:", error);
    return {
      success: false,
      message: "Failed to fetch owners",
      data: {
        body: [],
        pagination: emptyPagination,
      },
    };
  }
}

