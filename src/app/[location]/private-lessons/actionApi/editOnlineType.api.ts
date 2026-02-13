import { apiClient } from "@/lib/api/client";

/** 0 = In Class, 1 = Online */
export type OnlineFlag = 0 | 1;

export interface EditOnlineTypeRequest {
  lessonIds: number[];
  online: OnlineFlag;
}

export interface EditOnlineTypeResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

interface EditOnlineTypeApiResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

/**
 * PUT /admin/v2/{location}/private-lesson/edit-online-type
 * Updates online type for the given lessons. online: 0 = In Class, 1 = Online.
 * Throws on HTTP/network error so callers only run success path after a real response.
 */
export async function editOnlineType(
  location: string,
  payload: EditOnlineTypeRequest
): Promise<EditOnlineTypeResponse> {
  const response = await apiClient.put<EditOnlineTypeApiResponse>(
    `/admin/v2/${location}/private-lesson/edit-online-type`,
    payload
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;
  const lessonIds = body?.data?.lessonIds ?? [];

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to edit online type"
    );
  }

  return {
    success: true,
    data: { lessonIds },
    message,
  };
}
