import { OwnerRow } from "../owners.api";
import {
  applyActiveFilter as applyActiveFilterUtil,
  applyPagination as applyPaginationUtil,
  applyTextFilter as applyTextFilterUtil,
  sortByField,
} from "@/utils/listingUtils";

export type SortField = "firstName" | "lastName" | "email";
export type SortDirection = "asc" | "desc";

/**
 * Sort owners by field
 * @deprecated Use sortByField from @/utils/listingUtils instead
 */
export function sortOwners(data: OwnerRow[], field: SortField, direction: SortDirection): OwnerRow[] {
  return sortByField(data, field, direction);
}

/**
 * Apply active/inactive filter to data
 * @deprecated Use applyActiveFilter from @/utils/listingUtils instead
 */
export function applyActiveFilter(data: OwnerRow[], showActive?: boolean, showInActive?: boolean): OwnerRow[] {
  return applyActiveFilterUtil(data, showActive, showInActive);
}

/**
 * Apply text filter to a specific field
 * @deprecated Use applyTextFilter from @/utils/listingUtils instead
 */
export function applyTextFilter(
  data: OwnerRow[],
  field: keyof Pick<OwnerRow, "firstName" | "lastName" | "email">,
  searchValue?: string
): OwnerRow[] {
  return applyTextFilterUtil(data, field, searchValue);
}

/**
 * Apply pagination to data
 * @deprecated Use applyPagination from @/utils/listingUtils instead
 */
export function applyPagination(
  data: OwnerRow[],
  page: number,
  limit: number
): { paginatedData: OwnerRow[]; total: number; totalPages: number } {
  return applyPaginationUtil(data, page, limit);
}

