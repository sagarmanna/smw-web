import { AdministratorRow } from "../administrators.api";

export type SortField = "firstName" | "lastName" | "email";
export type SortDirection = "asc" | "desc";

export function sortAdministrators(
  data: AdministratorRow[],
  field: SortField,
  direction: SortDirection
): AdministratorRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aValue: string;
    let bValue: string;
    
    if (field === "firstName") {
      aValue = a.firstName || "";
      bValue = b.firstName || "";
    } else if (field === "lastName") {
      aValue = a.lastName || "";
      bValue = b.lastName || "";
    } else {
      aValue = a.email || "";
      bValue = b.email || "";
    }
    
    const comparison = aValue.localeCompare(bValue);
    return direction === "desc" ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Apply active/inactive filter to data
 */
export function applyActiveFilter(
  data: AdministratorRow[],
  showActive?: boolean,
  showInActive?: boolean
): AdministratorRow[] {
  // If both filters are undefined, show all
  if (showActive === undefined && showInActive === undefined) {
    return data;
  }
  
  // If only active filter is set
  if (showActive === true && showInActive === false) {
    return data.filter(row => row.isActive === true);
  }
  
  // If only inactive filter is set
  if (showActive === false && showInActive === true) {
    return data.filter(row => row.isActive === false);
  }
  
  // If both are true or both are false, show all
  return data;
}

/**
 * Apply text filter to a specific field
 */
export function applyTextFilter(
  data: AdministratorRow[],
  field: keyof Pick<AdministratorRow, 'firstName' | 'lastName' | 'email'>,
  searchValue?: string
): AdministratorRow[] {
  if (!searchValue) return data;
  
  const searchTerm = searchValue.toLowerCase().trim();
  return data.filter(row => {
    const fieldValue = (row[field] || "").toString().toLowerCase();
    return fieldValue.includes(searchTerm);
  });
}

/**
 * Apply pagination to data
 */
export function applyPagination(
  data: AdministratorRow[],
  page: number,
  limit: number
): { paginatedData: AdministratorRow[]; total: number; totalPages: number } {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  
  return { paginatedData, total, totalPages };
}

