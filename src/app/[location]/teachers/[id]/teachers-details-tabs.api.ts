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

