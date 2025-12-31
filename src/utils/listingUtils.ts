/**
 * Generic utility functions for listing pages
 * Provides reusable sorting, filtering, and pagination logic
 */

/**
 * Generic sort function for any data type
 */
export function sortByField<T>(
  data: T[],
  field: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    const aValue = (a[field] || '') as string;
    const bValue = (b[field] || '') as string;
    
    const comparison = String(aValue).localeCompare(String(bValue));
    return direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Apply active/inactive filter to data
 * Works with any object that has an isActive boolean property
 */
export function applyActiveFilter<T extends { isActive: boolean }>(
  data: T[],
  showActive?: boolean,
  showInActive?: boolean
): T[] {
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
export function applyTextFilter<T>(
  data: T[],
  field: keyof T,
  searchValue?: string
): T[] {
  if (!searchValue) return data;
  
  const searchTerm = searchValue.toLowerCase().trim();
  return data.filter(row => {
    const fieldValue = (row[field] || '').toString().toLowerCase();
    return fieldValue.includes(searchTerm);
  });
}

/**
 * Apply pagination to data
 */
export function applyPagination<T>(
  data: T[],
  page: number,
  limit: number
): { paginatedData: T[]; total: number; totalPages: number } {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  
  return { paginatedData, total, totalPages };
}

/**
 * Build active/inactive filter flags from filter key
 */
export function buildActiveFilterFlags(
  activeFilter?: string
): { showActive: boolean; showInActive: boolean } {
  const showActive = activeFilter === 'inactive' ? false : true;
  const showInActive = activeFilter === 'active' ? false : true;
  
  return { showActive, showInActive };
}

