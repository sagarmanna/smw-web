import { StudentRow } from "../students.api";

export type SortField = "firstName" | "lastName" | "customer";
export type SortDirection = "asc" | "desc";

export function sortStudents(
  data: StudentRow[],
  field: SortField,
  direction: SortDirection
): StudentRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    const aValue = a[field] || "";
    const bValue = b[field] || "";
    const comparison = aValue.localeCompare(bValue);
    return direction === "desc" ? -comparison : comparison;
  });

  return sorted;
}

