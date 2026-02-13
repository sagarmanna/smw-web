import { apiClient } from "@/lib/api/client";

export interface DeleteLessonsRequest {
  lessonIds: number[];
}

export interface DeleteLessonsResponse {
  success: boolean;
  data: {
    url?: string;
  };
  message?: string;
}

interface DeleteLessonsApiResponse {
  success: boolean;
  data: {
    url?: string;
  };
  message?: string;
}

/**
 * DELETE /admin/v2/{location}/private-lessons/delete
 * Deletes the given lessons. Request body: { lessonIds }.
 * Throws on HTTP/network error so callers only run success path after a real response.
 */
export async function deleteLessonsApi(
  location: string,
  payload: DeleteLessonsRequest
): Promise<DeleteLessonsResponse> {
  const response = await apiClient.delete<DeleteLessonsApiResponse>(
    `/admin/v2/${location}/private-lessons/delete`,
    { data: payload }
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to delete lessons"
    );
  }

  return {
    success: true,
    data: body?.data ?? {},
    message,
  };
}
