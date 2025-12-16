import { GroupCourseRow } from "../types";

export type SortField = "course" | "teacher" | "startDate" | "endDate";
export type SortDirection = "asc" | "desc";

export function sortGroupCourses(
  data: GroupCourseRow[],
  field: SortField,
  direction: SortDirection
): GroupCourseRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";
    
    switch (field) {
      case "course":
        aValue = a.course || "";
        bValue = b.course || "";
        break;
      case "teacher":
        aValue = a.teacher || "";
        bValue = b.teacher || "";
        break;
      case "startDate":
        aValue = a.startDate || "";
        bValue = b.startDate || "";
        break;
      case "endDate":
        aValue = a.endDate || "";
        bValue = b.endDate || "";
        break;
    }
    
    const comparison = typeof aValue === "string" && typeof bValue === "string"
      ? aValue.localeCompare(bValue)
      : typeof aValue === "number" && typeof bValue === "number"
      ? aValue - bValue
      : String(aValue).localeCompare(String(bValue));
    
    return direction === "desc" ? -comparison : comparison;
  });

  return sorted;
}

