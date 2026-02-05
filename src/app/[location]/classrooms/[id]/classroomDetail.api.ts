import { apiClient } from "@/lib/api/client";

/**
 * Classroom unavailability item as returned by the API
 */
export interface ClassroomUnavailabilityApiItem {
  id: number;
  classroomId: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

/**
 * API response for GET classroom unavailabilities
 */
export interface ClassroomUnavailabilityListResponse {
  success: boolean;
  data: ClassroomUnavailabilityApiItem[];
  message: string;
}

/**
 * Request body for creating a classroom unavailability
 */
export interface CreateClassroomUnavailabilityRequest {
  fromDate: string;
  toDate: string;
  reason: string;
}

/**
 * API response for POST create classroom unavailability
 */
export interface CreateClassroomUnavailabilityResponse {
  success: boolean;
  data: ClassroomUnavailabilityApiItem;
  message: string;
}

/**
 * Request body for updating a classroom unavailability
 */
export interface UpdateClassroomUnavailabilityRequest {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

/**
 * API response for PUT update classroom unavailability
 */
export interface UpdateClassroomUnavailabilityResponse {
  success: boolean;
  data: ClassroomUnavailabilityApiItem;
  message: string;
}

/**
 * API response for DELETE classroom unavailability
 */
export interface DeleteClassroomUnavailabilityResponse {
  success: boolean;
  message: string;
}

/**
 * Safely extracts an error message from an API error response
 * Falls back to the provided default message when not available.
 */
function getUnavailabilityErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    fallback
  );
}

/**
 * Fetches unavailabilities for a classroom
 * GET /admin/v2/{location}/classroom-unavailability/{classroomId}
 *
 * @param location - The location identifier (e.g. training-location)
 * @param classroomId - The classroom id
 * @returns Promise with list of unavailabilities or empty array on error
 */
export async function getClassroomUnavailabilities(
  location: string,
  classroomId: number
): Promise<ClassroomUnavailabilityListResponse> {
  try {
    const response = await apiClient.get<ClassroomUnavailabilityListResponse>(
      `/admin/v2/${location}/classroom-unavailability/${classroomId}`
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message ?? "Unavailabilities retrieved successfully",
      };
    }

    return {
      success: false,
      data: [],
      message: response.data?.message ?? "Failed to fetch unavailabilities",
    };
  } catch (error) {
    const message = getUnavailabilityErrorMessage(error, "Failed to fetch unavailabilities");
    console.error("Error fetching classroom unavailabilities:", error);
    return { success: false, data: [], message };
  }
}

/**
 * Creates a classroom unavailability
 * POST /admin/v2/{location}/classroom-unavailability/{classroomId}/create
 *
 * @param location - The location identifier (e.g. training-location)
 * @param classroomId - The classroom id
 * @param payload - fromDate, toDate, reason
 * @returns Promise with created unavailability or error
 */
export async function createClassroomUnavailability(
  location: string,
  classroomId: number,
  payload: CreateClassroomUnavailabilityRequest
): Promise<CreateClassroomUnavailabilityResponse> {
  try {
    const response = await apiClient.post<CreateClassroomUnavailabilityResponse>(
      `/admin/v2/${location}/classroom-unavailability/${classroomId}/create`,
      payload
    );

    if (response.data?.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message ?? "Unavailability created successfully",
      };
    }

    return {
      success: false,
      data: {} as ClassroomUnavailabilityApiItem,
      message: response.data?.message ?? "Failed to create unavailability",
    };
  } catch (error) {
    const message = getUnavailabilityErrorMessage(error, "Failed to create unavailability");
    console.error("Error creating classroom unavailability:", error);
    throw new Error(message);
  }
}

/**
 * Updates a classroom unavailability
 * PUT /admin/v2/{location}/classroom-unavailability/{classroomId}/update
 *
 * @param location - The location identifier (e.g. training-location)
 * @param classroomId - The classroom id
 * @param payload - id, fromDate, toDate, reason
 * @returns Promise with updated unavailability or error
 */
export async function updateClassroomUnavailability(
  location: string,
  classroomId: number,
  payload: UpdateClassroomUnavailabilityRequest
): Promise<UpdateClassroomUnavailabilityResponse> {
  try {
    const response = await apiClient.put<UpdateClassroomUnavailabilityResponse>(
      `/admin/v2/${location}/classroom-unavailability/${classroomId}/update`,
      payload
    );

    if (response.data?.success && response.data.data) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message ?? "Unavailability updated successfully",
      };
    }

    return {
      success: false,
      data: {} as ClassroomUnavailabilityApiItem,
      message: response.data?.message ?? "Failed to update unavailability",
    };
  } catch (error) {
    const message = getUnavailabilityErrorMessage(error, "Failed to update unavailability");
    console.error("Error updating classroom unavailability:", error);
    throw new Error(message);
  }
}

/**
 * Deletes a classroom unavailability
 * DELETE /admin/v2/{location}/classroom-unavailability/{classroomId}/delete?id={id}
 *
 * @param location - The location identifier (e.g. training-location)
 * @param classroomId - The classroom id
 * @param id - The unavailability id to delete
 * @returns Promise with success or error
 */
export async function deleteClassroomUnavailability(
  location: string,
  classroomId: number,
  id: number
): Promise<DeleteClassroomUnavailabilityResponse> {
  try {
    const response = await apiClient.delete<DeleteClassroomUnavailabilityResponse>(
      `/admin/v2/${location}/classroom-unavailability/${classroomId}/delete`,
      { params: { id } }
    );

    if (response.data?.success) {
      return {
        success: true,
        message: response.data.message ?? "Unavailability deleted successfully",
      };
    }

    return {
      success: false,
      message: response.data?.message ?? "Failed to delete unavailability",
    };
  } catch (error) {
    const message = getUnavailabilityErrorMessage(error, "Failed to delete unavailability");
    console.error("Error deleting classroom unavailability:", error);
    throw new Error(message);
  }
}
