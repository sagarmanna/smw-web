/**
 * Location availability API
 *
 * Endpoint: GET /admin/v2/{location}/render-events?type=1|2
 * - type=1: Operation time availability
 * - type=2: Schedule visibility
 */

import { apiClient } from "@/lib/api/client";

export type LocationRenderEventsType = 1 | 2;

export type LocationRenderEventRow = {
  id: number;
  resourceId: string | number; // 1-7 (Mon-Sun)
  start: string; // "YYYY-MM-DD HH:mm:ss" (backend)
  end: string; // "YYYY-MM-DD HH:mm:ss" (backend)
  backgroundColor?: string;
  className?: string;
};

export interface LocationRenderEventsApiResponse {
  success: boolean;
  message?: string;
  data: {
    body: LocationRenderEventRow[];
  };
}

export interface CopyAvailabilityApiResponse {
  success: boolean;
  message?: string;
  data?: {
    locationId: number;
  };
}

export async function getLocationRenderEvents(
  location: string,
  type: LocationRenderEventsType
): Promise<LocationRenderEventRow[] | null> {
  try {
    const response = await apiClient.get<LocationRenderEventsApiResponse>(
      `/admin/v2/${location}/render-events`,
      { params: { type } }
    );

    if (!response.data.success) return null;
    const rows = response.data.data?.body;
    return Array.isArray(rows) ? rows : null;
  } catch (error: unknown) {
    console.error("Error fetching location render events:", error);
    return null;
  }
}

/**
 * Copies availability from operation time (type=1) to schedule visibility (type=2)
 * Endpoint: POST /admin/v2/${location}/copy-availability
 */
export async function copyLocationAvailability(
  location: string
): Promise<CopyAvailabilityApiResponse> {
  try {
    const response = await apiClient.post<CopyAvailabilityApiResponse>(
      `/admin/v2/${location}/copy-availability`,
      {
        location,
        fromType: 1,
        toType: 2,
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error copying location availability:", error);
    return {
      success: false,
      message: "Failed to copy availability",
    };
  }
}

