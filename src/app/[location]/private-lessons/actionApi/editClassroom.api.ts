import { apiClient } from "@/lib/api/client";

export interface EditClassroomRequest {
  lessonIds: number[];
  classroomId: number;
}

export interface EditClassroomResponse {
  success: boolean;
  data: {
    updatedLessonIds: number[];
  };
  message?: string;
}

interface EditClassroomApiResponse {
  success: boolean;
  data: {
    updatedLessonIds: number[];
  };
  message?: string;
}

/**
 * PUT /admin/v2/{location}/private-lesson/edit-classroom
 * Assigns the given classroom to the specified lessons.
 * Throws on HTTP/network error so callers only run success path after a real response.
 */
export async function editClassroom(
  location: string,
  payload: EditClassroomRequest
): Promise<EditClassroomResponse> {
  const response = await apiClient.put<EditClassroomApiResponse>(
    `/admin/v2/${location}/private-lesson/edit-classroom`,
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
        : "Failed to edit classroom"
    );
  }

  return {
    success: true,
    data: { updatedLessonIds },
    message,
  };
}
