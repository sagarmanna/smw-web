import { apiClient } from "@/lib/api/client";

export interface EditDurationRequest {
  lessonIds: number[];
  /** Duration in HH:MM:SS format (e.g. "00:30:00", "01:00:00") */
  duration: string;
}

export interface EditDurationResponse {
  success: boolean;
  data: {
    updatedLessonIds: number[];
  };
  message?: string;
}

interface EditDurationApiResponse {
  success: boolean;
  data: {
    updatedLessonIds: number[];
  };
  message?: string;
}

/**
 * POST /admin/v2/{location}/private-lesson/edit-duration
 * Updates duration for the given lessons.
 * Throws on HTTP/network error so callers only run success path after a real response.
 */
export async function editDuration(
  location: string,
  payload: EditDurationRequest
): Promise<EditDurationResponse> {
  const response = await apiClient.post<EditDurationApiResponse>(
    `/admin/v2/${location}/private-lesson/edit-duration`,
    payload
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;
  const updatedLessonIds = body?.data?.updatedLessonIds ?? [];

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to edit duration"
    );
  }

  return {
    success: true,
    data: { updatedLessonIds },
    message,
  };
}
