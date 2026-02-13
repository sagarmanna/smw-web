import { apiClient } from "@/lib/api/client";

export interface BulkRescheduleRequest {
  lessonIds: number[];
  /** New date in YYYY-MM-DD format */
  newDate: string;
}

export interface RescheduledLessonItem {
  oldLessonId: number;
  newLessonId: number;
}

export interface BulkRescheduleResponse {
  success: boolean;
  data: {
    rescheduledLessons: RescheduledLessonItem[];
  };
  message?: string;
}

interface BulkRescheduleApiResponse {
  success: boolean;
  data: {
    rescheduledLessons?: RescheduledLessonItem[];
  };
  message?: string;
}

/** Normalize rescheduledLessons from API (camelCase or snake_case, or nested) */
function normalizeRescheduledLessons(body: unknown): RescheduledLessonItem[] {
  if (!body || typeof body !== "object") return [];
  const data = (body as Record<string, unknown>)?.data;
  if (!data || typeof data !== "object") return [];
  const dataObj = data as Record<string, unknown>;
  const raw =
    dataObj.rescheduledLessons ??
    dataObj.rescheduled_lessons ??
    (Array.isArray(dataObj) ? dataObj : []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is RescheduledLessonItem =>
        item != null &&
        typeof item === "object" &&
        typeof (item as RescheduledLessonItem).oldLessonId === "number" &&
        typeof (item as RescheduledLessonItem).newLessonId === "number"
    )
    .map((item) => ({
      oldLessonId: (item as RescheduledLessonItem).oldLessonId,
      newLessonId: (item as RescheduledLessonItem).newLessonId,
    }));
}

/**
 * PUT /admin/v2/{location}/private-lesson/bulk-reschedule
 * Reschedules the given lessons to the new date. Returns oldLessonId -> newLessonId mapping.
 * Throws only when API explicitly returns success: false or on HTTP error.
 */
export async function bulkReschedule(
  location: string,
  payload: BulkRescheduleRequest
): Promise<BulkRescheduleResponse> {
  const response = await apiClient.put<BulkRescheduleApiResponse & { data?: unknown }>(
    `/admin/v2/${location}/private-lesson/bulk-reschedule`,
    payload
  );

  const body = response.data;
  const message =
    typeof body?.message === "string" ? body.message : undefined;
  const explicitSuccess = body?.success;
  const isHttpOk = response.status >= 200 && response.status < 300;

  if (explicitSuccess === false) {
    throw new Error(
      message?.trim() ? message : "Failed to reschedule lessons"
    );
  }

  const rescheduledLessons =
    isHttpOk && body ? normalizeRescheduledLessons(body) : [];

  return {
    success: true,
    data: { rescheduledLessons },
    message,
  };
}
