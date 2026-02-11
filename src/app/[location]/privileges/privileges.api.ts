import { apiClient } from "@/lib/api/client";

function getApiErrorMessage(error: unknown, defaultMessage: string): string {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  return (
    apiError.response?.data?.message ||
    apiError.message ||
    defaultMessage
  );
}

/**
 * GET /v2/{location}/permissions response item.
 * When GET includes `permission` (e.g. "manageBirthdays"), PUT can use it directly—no map needed.
 */
export interface TrainingLocationPermissionApiRow {
  description: string;
  staffmember: boolean;
  /** Permission key for PUT; when present, we send it as-is without any transform. */
  permission?: string;
}

export interface TrainingLocationPermissionsApiResponse {
  success: boolean;
  data: {
    permissions: TrainingLocationPermissionApiRow[];
  };
  message: string;
}

/** PUT body: permission (from GET) and enable; no frontend transform when GET returns permission. */
export interface UpdatePermissionRequest {
  permission: string;
  enable: boolean;
}

export interface UpdatePermissionResponse {
  success: boolean;
  data: {
    permission: string;
    enable: boolean;
  };
  message: string;
}

export async function getTrainingLocationPermissions(location: string): Promise<{
  success: boolean;
  message: string;
  data: TrainingLocationPermissionApiRow[];
}> {
  try {
    const response = await apiClient.get<TrainingLocationPermissionsApiResponse>(
      `admin/v2/${location}/permissions`
    );
    const payload = response.data;

    const rows: TrainingLocationPermissionApiRow[] = (payload.data?.permissions || []).filter(
      (r) => typeof r.description === "string" && r.description.length > 0
    );

    return {
      success: payload.success,
      message: payload.message || "",
      data: rows,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to fetch permissions"),
      data: [],
    };
  }
}

export async function updateTrainingLocationPermission(
  location: string,
  payload: UpdatePermissionRequest
): Promise<UpdatePermissionResponse> {
  try {
    const response = await apiClient.put<UpdatePermissionResponse>(
      `/admin/v2/${location}/permissions`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update permission"
    );
  }
}
