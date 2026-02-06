/**
 * Location availability API
 *
 * Endpoint: GET /admin/v2/{location}/render-events?type=1|2
 * - type=1: Operation time availability
 * - type=2: Schedule visibility
 */

import { apiClient } from "@/lib/api/client";

/** Extracts user-facing error message from API/axios errors. */
function extractApiErrorMessage(
  error: unknown,
  defaultMsg: string
): string {
  const axiosError = error as { response?: { data?: { message?: string | string[] } } };
  const msg = axiosError.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg || defaultMsg);
}

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

export interface CreateAvailabilityBlockRequest {
  resourceId: number;
  type: 1 | 2;
  startTime: string; // "YYYY-MM-DD HH:mm:ss"
  endTime: string; // "YYYY-MM-DD HH:mm:ss"
}

export interface CreateAvailabilityBlockResponse {
  success: boolean;
  message?: string;
  data?: { id?: number };
}

/**
 * Creates an availability block (used when selecting a new slot)
 * Endpoint: POST /admin/v2/{location}/create
 */
export async function createLocationAvailabilityBlock(
  location: string,
  payload: CreateAvailabilityBlockRequest
): Promise<CreateAvailabilityBlockResponse> {
  try {
    const response = await apiClient.post<CreateAvailabilityBlockResponse>(
      `/admin/v2/${location}/create`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating location availability block:", error);
    return {
      success: false,
      message: extractApiErrorMessage(error, "Failed to create availability block"),
    };
  }
}

export interface EditAvailabilityBlockRequest extends CreateAvailabilityBlockRequest {
  id: number;
}

/**
 * Edits an availability block (used for drag-and-drop move, resize)
 * Endpoint: PUT /admin/v2/{location}/edit-availability?id={id}
 * Body: { resourceId, type, startTime, endTime } - id goes in query param
 */
export async function editLocationAvailabilityBlock(
  location: string,
  payload: EditAvailabilityBlockRequest
): Promise<CreateAvailabilityBlockResponse> {
  const { id, ...body } = payload;
  try {
    const response = await apiClient.put<CreateAvailabilityBlockResponse>(
      `/admin/v2/${location}/edit-availability`,
      body,
      { params: { id } }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error editing location availability block:", error);
    return {
      success: false,
      message: extractApiErrorMessage(error, "Failed to edit availability block"),
    };
  }
}

/**
 * Deletes an availability block
 * Endpoint: DELETE /admin/v2/{location}/availability/{id}
 */
export async function deleteLocationAvailabilityBlock(
  location: string,
  id: number
): Promise<CreateAvailabilityBlockResponse> {
  try {
    const response = await apiClient.delete<CreateAvailabilityBlockResponse>(
      `/admin/v2/${location}/availability/${id}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error deleting location availability block:", error);
    return {
      success: false,
      message: extractApiErrorMessage(error, "Failed to delete availability block"),
    };
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
      message: extractApiErrorMessage(error, "Failed to copy availability"),
    };
  }
}

