import { apiClient } from "@/lib/api/client";

export interface ReasonToUnscheduleItem {
  id: number;
  reason: string;
}

export interface GetReasonToUnscheduleResponse {
  success: boolean;
  data: {
    title: string;
    reasons: ReasonToUnscheduleItem[];
  };
  message?: string;
}

interface GetReasonToUnscheduleApiResponse {
  success: boolean;
  data: {
    title?: string;
    reasons?: ReasonToUnscheduleItem[];
  };
  message?: string;
}

/**
 * GET /admin/v2/{location}/private-lesson/reason-to-unschedule
 * Returns list of reasons for unscheduling (for dynamic modal options).
 */
export async function getReasonToUnschedule(
  location: string
): Promise<GetReasonToUnscheduleResponse> {
  const response = await apiClient.get<GetReasonToUnscheduleApiResponse>(
    `/admin/v2/${location}/private-lesson/reason-to-unschedule`
  );

  const body = response.data;
  if (!body?.success || !Array.isArray(body?.data?.reasons)) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to load reasons"
    );
  }

  return {
    success: true,
    data: {
      title: body.data.title ?? "Reason To Unschedule",
      reasons: body.data.reasons,
    },
    message: body.message,
  };
}

export interface UnscheduleLessonsRequest {
  lessonIds: number[];
  reason: string;
}

export interface UnscheduleLessonsResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

interface UnscheduleLessonsApiResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

/**
 * PUT /admin/v2/{location}/private-lesson/unschedule
 * Unschedules the given lessons with the provided reason.
 * Throws on failure so callers can show API response message.
 */
export async function unscheduleLessons(
  location: string,
  payload: UnscheduleLessonsRequest
): Promise<UnscheduleLessonsResponse> {
  const response = await apiClient.put<UnscheduleLessonsApiResponse>(
    `/admin/v2/${location}/private-lesson/unschedule`,
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
        : "Failed to unschedule lessons"
    );
  }

  return {
    success: true,
    data: { lessonIds },
    message,
  };
}
