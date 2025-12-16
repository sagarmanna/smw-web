import { EnrolmentRow } from "../enrolmentsListing.api";

export type SortField = "program" | "student" | "teacher" | "startDate" | "endDate" | "lessonsRemaining";
export type SortDirection = "asc" | "desc";

export function sortEnrolments(
  data: EnrolmentRow[],
  field: SortField,
  direction: SortDirection
): EnrolmentRow[] {
  const sorted = [...data];
  
  sorted.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (field === "lessonsRemaining") {
      aValue = a.lessonsRemaining ?? 0;
      bValue = b.lessonsRemaining ?? 0;
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === "desc" ? -comparison : comparison;
    } else {
      aValue = (a[field] || "") as string;
      bValue = (b[field] || "") as string;
      const comparison = aValue.localeCompare(bValue);
      return direction === "desc" ? -comparison : comparison;
    }
  });

  return sorted;
}


