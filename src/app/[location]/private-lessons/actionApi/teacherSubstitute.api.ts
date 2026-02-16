import { apiClient } from "@/lib/api/client";

// --- Get available teachers (GET with ids only) ---

export interface TeacherSubstituteTeacher {
  id: number;
  name: string;
}

export interface GetTeacherSubstituteTeachersResponse {
  success: boolean;
  data: { teachers: TeacherSubstituteTeacher[] };
  message?: string;
}

interface GetTeacherSubstituteTeachersApiResponse {
  success: boolean;
  body?: { teachers?: TeacherSubstituteTeacher[] };
  data?: { teachers?: TeacherSubstituteTeacher[] };
  message?: string;
}

/**
 * GET /admin/v2/{location}/teacher-substitute/lesson?ids=...
 * Returns list of teachers available for substituting the given lesson ids.
 * Throws on failure so callers can show API response message.
 */
export async function getTeacherSubstituteTeachers(
  location: string,
  ids: number[]
): Promise<GetTeacherSubstituteTeachersResponse> {
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", String(id)));

  const response = await apiClient.get<GetTeacherSubstituteTeachersApiResponse>(
    `/admin/v2/${location}/teacher-substitute/lesson?${params.toString()}`
  );

  const body = response.data;
  const rawTeachers = body?.data?.teachers ?? body?.body?.teachers ?? [];
  const teachers = Array.isArray(rawTeachers)
    ? rawTeachers.filter(
        (t): t is TeacherSubstituteTeacher =>
          t != null &&
          typeof t === "object" &&
          typeof (t as TeacherSubstituteTeacher).id === "number" &&
          typeof (t as TeacherSubstituteTeacher).name === "string"
      )
    : [];

  if (!body?.success) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to load substitute teachers"
    );
  }

  return {
    success: true,
    data: { teachers },
    message: body?.message,
  };
}

// --- Substitute lesson / review (GET with ids + teacherId) ---

export interface SubstituteLessonItem {
  id: number;
  courseId: number;
  teacherId: number;
  teacherName: string;
  programName: string;
  /** Comma-separated or single student name from API */
  studentName?: string;
  date: string;
  duration: string;
  status: number;
  isConfirmed: number;
}

export interface SubstituteLessonResponse {
  success: boolean;
  data: {
    status: boolean;
    hasConflicts: boolean;
    newLessonIds: number[];
    conflictedLessonIds: number[];
    conflicts: Record<string, string[]>;
    teachers: TeacherSubstituteTeacher[];
    lessons: SubstituteLessonItem[];
  };
  message?: string;
}

interface SubstituteLessonApiResponse {
  success: boolean;
  data?: {
    status?: boolean;
    hasConflicts?: boolean;
    newLessonIds?: number[];
    conflictedLessonIds?: number[];
    conflicts?: Record<string, string[]>;
    teachers?: TeacherSubstituteTeacher[];
    lessons?: SubstituteLessonItem[];
  };
  message?: string;
}

/**
 * GET /admin/v2/{location}/teacher-substitute/lesson?ids=...&teacherId=...&resolvingConflicts=...
 * Performs teacher substitution for the given lessons. Returns new lesson ids, lessons, and conflicts.
 * resolvingConflicts defaults to false.
 * Throws on failure so callers can show API response message.
 */
export async function substituteLesson(
  location: string,
  params: { ids: number[]; teacherId: number; resolvingConflicts?: boolean }
): Promise<SubstituteLessonResponse> {
  const search = new URLSearchParams();
  params.ids.forEach((id) => search.append("ids", String(id)));
  search.set("teacherId", String(params.teacherId));
  search.set("resolvingConflicts", String(params.resolvingConflicts ?? false));

  const response = await apiClient.get<SubstituteLessonApiResponse>(
    `/admin/v2/${location}/teacher-substitute/lesson?${search.toString()}`
  );

  const body = response.data;
  const data = body?.data ?? {};
  const explicitSuccess = body?.success === true;

  if (explicitSuccess === false) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to substitute teacher"
    );
  }

  const newLessonIds = Array.isArray(data.newLessonIds) ? data.newLessonIds : [];
  const conflictedLessonIds = Array.isArray(data.conflictedLessonIds) ? data.conflictedLessonIds : [];
  const conflicts = data.conflicts && typeof data.conflicts === "object" ? data.conflicts : {};
  const teachers = Array.isArray(data.teachers) ? data.teachers : [];
  const lessons = Array.isArray(data.lessons) ? data.lessons : [];

  return {
    success: true,
    data: {
      status: data.status === true,
      hasConflicts: data.hasConflicts === true,
      newLessonIds,
      conflictedLessonIds,
      conflicts,
      teachers,
      lessons,
    },
    message: body?.message,
  };
}

// --- Confirm substitution (PUT) ---

export interface ConfirmTeacherSubstituteRequest {
  ids: number[];
  newLessonIds: number[];
}

export interface ConfirmTeacherSubstituteResponse {
  success: boolean;
  data?: { url?: string };
  message?: string;
}

interface ConfirmTeacherSubstituteApiResponse {
  success: boolean;
  data?: { url?: string };
  message?: string;
  errorCode?: string;
}

/**
 * PUT /admin/v2/{location}/teacher-substitute/confirm
 * Confirms the teacher substitution. On success, returns data.url (relative path)
 * for redirect. Caller should redirect like customers/InvoicesTable:
 * window.location.href = `${NEXT_PUBLIC_LEGACY_URL}/${response.data.url}` (trim leading slash if needed).
 * Throws on failure so callers can show API response message.
 */
export async function confirmTeacherSubstitute(
  location: string,
  payload: ConfirmTeacherSubstituteRequest
): Promise<ConfirmTeacherSubstituteResponse> {
  const response = await apiClient.put<ConfirmTeacherSubstituteApiResponse>(
    `/admin/v2/${location}/teacher-substitute/confirm`,
    payload
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;
  const url = body?.data?.url;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to confirm teacher substitution"
    );
  }

  return {
    success: true,
    data: url != null && url !== "" ? { url: String(url).trim() } : undefined,
    message,
  };
}
