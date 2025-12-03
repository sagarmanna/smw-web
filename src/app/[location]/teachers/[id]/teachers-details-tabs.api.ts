import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Unavailability API Response Types
// ---------------------------------------------

export interface UnavailableHour {
  start: string;
  end: string;
  reason: string;
}

interface UnavailabilityApiResponseBody {
  unavailableHours: UnavailableHour[];
}

export interface UnavailabilityApiResponse {
  success: boolean;
  data: {
    body: UnavailabilityApiResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Students API Response Types
// ---------------------------------------------

export interface TeacherStudent {
  id: number;
  fullName: string;
}

interface StudentsApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentsApiResponse {
  success: boolean;
  data: {
    body: TeacherStudent[];
    pagination: StudentsApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// Unavailability API
// ---------------------------------------------

/**
 * Fetches unavailability data for a teacher
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/unavailability
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherUnavailability(
  location: string,
  teacherId: number
): Promise<UnavailableHour[] | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/unavailability`;
    const response = await apiClient.get<UnavailabilityApiResponse>(url);

    if (response.data.success && response.data.data?.body?.unavailableHours) {
      return response.data.data.body.unavailableHours;
    }

    return [];
  } catch (error: unknown) {
    console.error("Error fetching teacher unavailability:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher unavailability"
    );
    return null;
  }
}

// ---------------------------------------------
// Students API
// ---------------------------------------------

/**
 * Fetches students data for a teacher with pagination
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/students
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise resolving to students data with pagination or null on error
 */
export async function getTeacherStudents(
  location: string,
  teacherId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ students: TeacherStudent[]; pagination: StudentsApiResponsePagination } | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/students`;
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    
    const response = await apiClient.get<StudentsApiResponse>(url, { params });

    if (response.data.success && response.data.data?.body && Array.isArray(response.data.data.body)) {
      return {
        students: response.data.data.body,
        pagination: response.data.data.pagination,
      };
    }

    return {
      students: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching teacher students:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher students"
    );
    return null;
  }
}

