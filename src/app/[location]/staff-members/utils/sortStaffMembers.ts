import { StaffMemberRow } from "../staffMembers.api";
import { sortByField, applyActiveFilter as applyActiveFilterUtil, applyTextFilter as applyTextFilterUtil, applyPagination as applyPaginationUtil } from "@/utils/listingUtils";

export type SortField = "firstName" | "lastName" | "email";
export type SortDirection = "asc" | "desc";

/**
 * Sort staff members by field
 * @deprecated Use sortByField from @/utils/listingUtils instead
 */
export function sortStaffMembers(
  data: StaffMemberRow[],
  field: SortField,
  direction: SortDirection
): StaffMemberRow[] {
  return sortByField(data, field, direction);
}

/**
 * Apply active/inactive filter to data
 * @deprecated Use applyActiveFilter from @/utils/listingUtils instead
 */
export function applyActiveFilter(
  data: StaffMemberRow[],
  showActive?: boolean,
  showInActive?: boolean
): StaffMemberRow[] {
  return applyActiveFilterUtil(data, showActive, showInActive);
}

/**
 * Apply text filter to a specific field
 * @deprecated Use applyTextFilter from @/utils/listingUtils instead
 */
export function applyTextFilter(
  data: StaffMemberRow[],
  field: keyof Pick<StaffMemberRow, 'firstName' | 'lastName' | 'email'>,
  searchValue?: string
): StaffMemberRow[] {
  return applyTextFilterUtil(data, field, searchValue);
}

/**
 * Apply pagination to data
 * @deprecated Use applyPagination from @/utils/listingUtils instead
 */
export function applyPagination(
  data: StaffMemberRow[],
  page: number,
  limit: number
): { paginatedData: StaffMemberRow[]; total: number; totalPages: number } {
  return applyPaginationUtil(data, page, limit);
}

