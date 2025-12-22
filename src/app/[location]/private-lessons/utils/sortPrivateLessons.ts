import { PrivateLessonRow } from "../privateLessonsListing.api";

export type SortField = "date" | "student" | "program" | "teacher";
export type SortDirection = "asc" | "desc";

export function sortPrivateLessons(
  data: PrivateLessonRow[],
  field: SortField,
  direction: SortDirection
): PrivateLessonRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aValue: string;
    let bValue: string;

    if (field === "date") {
      // Parse date string for comparison
      aValue = a.date || "";
      bValue = b.date || "";
    } else {
      // For student, program, teacher fields
      aValue = (a[field] || "") as string;
      bValue = (b[field] || "") as string;
    }

    const comparison = String(aValue).localeCompare(String(bValue));
    return direction === "desc" ? -comparison : comparison;
  });

  return sorted;
}

