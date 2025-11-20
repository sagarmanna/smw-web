import { TeacherRow } from "../teachers.api";

export type SortField = "firstName" | "lastName" | "email" | "phone";
export type SortDirection = "asc" | "desc";

export function sortTeachers(
  data: TeacherRow[],
  field: SortField,
  direction: SortDirection
): TeacherRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    const aValue = a[field] || "";
    const bValue = b[field] || "";
    const comparison = aValue.localeCompare(bValue);
    return direction === "desc" ? -comparison : comparison;
  });

  return sorted;
}

