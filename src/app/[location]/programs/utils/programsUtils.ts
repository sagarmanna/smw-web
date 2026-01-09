/**
 * Programs utilities
 * Contains sorting, pagination, and filtering functions
 */

import { ProgramRow } from "../programs.api";
import { applyPagination } from "@/utils/listingUtils";

// ============================================================================
// Types
// ============================================================================

export type SortField = "name" | "ratePerHour" | "ratePerCourse";
export type SortDirection = "asc" | "desc";

// ============================================================================
// Sorting Utilities
// ============================================================================

/**
 * Sort programs by field
 * Custom implementation needed to handle both string and number fields
 */
export function sortPrograms(
  data: ProgramRow[],
  field: SortField,
  direction: SortDirection
): ProgramRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    if (field === "name") {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (field === "ratePerHour") {
      aValue = a.ratePerHour || 0;
      bValue = b.ratePerHour || 0;
    } else if (field === "ratePerCourse") {
      aValue = a.ratePerCourse || 0;
      bValue = b.ratePerCourse || 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return direction === "desc" ? -comparison : comparison;
    } else {
      const comparison = (aValue as number) - (bValue as number);
      return direction === "desc" ? -comparison : comparison;
    }
  });

  return sorted;
}

// ============================================================================
// Pagination Utilities
// ============================================================================

/**
 * Apply pagination to programs data
 * Uses generic applyPagination utility
 */
export function paginatePrograms(
  data: ProgramRow[],
  page: number,
  limit: number
): { paginatedData: ProgramRow[]; total: number; totalPages: number } {
  return applyPagination(data, page, limit);
}

// ============================================================================
// Filtering Utilities
// ============================================================================

/**
 * Apply active/inactive filter to programs
 * Wrapper around generic applyActiveFilter to handle optional isActive field
 */
export function filterProgramsByStatus(
  data: ProgramRow[],
  showActive?: boolean,
  showInActive?: boolean
): ProgramRow[] {
  // If both filters are undefined, show all
  if (showActive === undefined && showInActive === undefined) {
    return data;
  }
  
  // If only active filter is set
  if (showActive === true && showInActive === false) {
    return data.filter(p => p.isActive === true);
  }
  
  // If only inactive filter is set
  if (showActive === false && showInActive === true) {
    return data.filter(p => p.isActive === false);
  }
  
  // If both are true or both are false/undefined, show all (no filtering)
  return data;
}

/**
 * Filter programs by type (PRIVATE or GROUP)
 */
export function filterProgramsByType(
  data: ProgramRow[],
  type: "PRIVATE" | "GROUP"
): ProgramRow[] {
  return data.filter(p => p.type === type);
}

