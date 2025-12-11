/**
 * Data transformation functions for students listing
 * Transforms API response data to internal application format
 */

import { StudentRow } from '../studentsListing.api';

// API response interface (matches actual API response structure)
// This is re-exported from studentsListing.api.ts for use in transformers
export interface StudentApiResponse {
  id: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  customerName: string;
  phoneNumber: string;
}

// Sort field type for transformation
export type StudentSortField = "firstName" | "lastName";

/**
 * Maps a single API student response to internal StudentRow format
 * @param apiStudent - Student data from API response
 * @returns StudentRow formatted for internal use
 */
export function mapApiResponseToStudentRow(
  apiStudent: StudentApiResponse
): StudentRow {
  return {
    userId: apiStudent.id.toString(),
    isActive: apiStudent.isActive,
    firstName: apiStudent.firstName,
    lastName: apiStudent.lastName,
    customer: apiStudent.customerName,
    phoneNumber: apiStudent.phoneNumber,
  };
}

/**
 * Maps an array of API student responses to internal StudentRow format
 * @param apiStudents - Array of student data from API response
 * @returns Array of StudentRow formatted for internal use
 */
export function mapApiResponseToStudentRows(
  apiStudents: StudentApiResponse[]
): StudentRow[] {
  return apiStudents.map(mapApiResponseToStudentRow);
}

/**
 * Applies client-side sorting to student rows as a fallback
 * when the API doesn't respect the order parameter
 * @param students - Array of StudentRow to sort
 * @param sortField - Field to sort by
 * @param order - Sort direction ('asc' or 'desc')
 * @returns Sorted array of StudentRow
 */
export function sortStudentRows(
  students: StudentRow[],
  sortField: StudentSortField,
  order: "asc" | "desc"
): StudentRow[] {
  const sorted = [...students].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    if (sortField === "firstName") {
      aValue = a.firstName || "";
      bValue = b.firstName || "";
    } else if (sortField === "lastName") {
      aValue = a.lastName || "";
      bValue = b.lastName || "";
    } else {
      return 0;
    }

    const comparison = aValue.localeCompare(bValue);
    return order === "desc" ? -comparison : comparison;
  });

  return sorted;
}

