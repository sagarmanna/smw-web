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

// ---------------------------------------------
// Time Voucher API Response Types
// ---------------------------------------------

export interface TimeVoucherLesson {
  id: number;
  time: string;
  program: string;
  student: string;
  duration: number;
}

export interface TimeVoucherDetailItem {
  date: string;
  lessons: TimeVoucherLesson[];
}

export interface TimeVoucherSummaryItem {
  date: string;
  duration: number;
}

export interface TimeVoucherApiResponse {
  success: boolean;
  data: {
    body: TimeVoucherDetailItem[] | TimeVoucherSummaryItem[];
    footer?: {
      totalDuration: number;
    };
  };
  message?: string;
}

export interface TimeVoucherQueryParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  summaryOnly: boolean;
}

// ---------------------------------------------
// Time Voucher API
// ---------------------------------------------

/**
 * Fetches time voucher data for a teacher
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/time-voucher
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param params - Query parameters for filtering and summary mode
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherTimeVoucher(
  location: string,
  teacherId: number,
  params: TimeVoucherQueryParams
): Promise<TimeVoucherApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/time-voucher`;
    const response = await apiClient.get<TimeVoucherApiResponse>(url, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        summaryOnly: params.summaryOnly,
      },
    });

    if (response.data.success) {
      return response.data;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher time voucher:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher time voucher"
    );
    return null;
  }
}

