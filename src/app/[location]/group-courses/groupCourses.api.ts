import { apiClient } from "@/lib/api/client";
import { GroupCourseRow } from "./types";

// Re-export for convenience
export type { GroupCourseRow } from "./types";

export interface GroupCoursesListResponse {
  success: boolean;
  message: string;
  data: {
    body: GroupCourseRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GroupCoursesQuery {
  page?: number;
  limit?: number;
  course?: string;
  teacher?: string;
  program?: string;
  showActive?: boolean;
  showInActive?: boolean;
  sort?: "course" | "teacher" | "startDate" | "endDate";
  order?: "asc" | "desc";
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

const FETCH_ALL_LIMIT = 99999; // For export scenarios

interface GroupCoursesListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: GroupCourseRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Helper to create empty response - DRY principle
 */
const createEmptyGroupCoursesResponse = (): GroupCoursesListResponse => ({
  success: false,
  message: "Failed to fetch group courses",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Builds query parameters for group courses API
 * Follows codebase pattern: only includes non-empty values
 */
const buildGroupCoursesQueryParams = (query: GroupCoursesQuery): URLSearchParams => {
  const params = new URLSearchParams();

  // Pagination - always include with defaults
  const page = query.page ?? DEFAULT_PAGINATION.page;
  const limit = query.limit ?? DEFAULT_PAGINATION.limit;
  params.append("page", page.toString());
  params.append(
    "limit",
    limit === -1 ? FETCH_ALL_LIMIT.toString() : limit.toString()
  );

  // Column filters (only include when present)
  if (query.course) params.append("course", query.course);
  if (query.teacher) params.append("teacher", query.teacher);
  if (query.program) params.append("program", query.program);

  // Status filter mapping
  // Backend expects: showAllCourses boolean
  // Map UI filter state to API parameter:
  // - active: showActive=true, showInActive=false => showAllCourses=false (active only)
  // - inactive: showActive=false, showInActive=true => showAllCourses=true (includes inactive)
  const showActive = query.showActive === true;
  const showInActive = query.showInActive === true;
  const showAllCourses = showInActive; // If showing inactive, show all courses
  params.append("showAllCourses", showAllCourses.toString());

  // Sorting - always include with defaults
  const sort = query.sort ?? "course";
  const order = query.order ?? "asc";
  params.append("sort", sort);
  params.append("order", order);

  return params;
};

/**
 * Fetches group courses list from API
 * @param location - Location identifier
 * @param query - Query parameters for filtering, sorting, and pagination
 * @returns Group courses list response or null on error
 */
export async function getGroupCourses(
  location: string,
  query: GroupCoursesQuery
): Promise<GroupCoursesListResponse | null> {
  try {
    const params = buildGroupCoursesQueryParams(query);

    const response = await apiClient.get<GroupCoursesListApiResponse>(
      `/admin/v2/${location}/course/list`,
      { params }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: response.data.data.body,
        pagination: response.data.data.pagination,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyGroupCoursesResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch group courses";
    return emptyResponse;
  }
}

export interface CreateGroupCourseRequest {
  programId: number;
  teacherId: number;
  duration: string; // Format: "HH:mm:ss" (e.g., "00:30:00")
  isOnline: number; // 0 or 1
  weeksCount: number;
  schedules: Array<{
    day: string; // Day name (e.g., "Wednesday")
    fromTime: string; // Format: "HH:mm:ss" (e.g., "09:00:00")
  }>;
}

export interface CreateGroupCourseResponse {
  success: boolean;
  data?: {
    courseId: number;
  };
  message?: string;
  errorCode?: string;
}

/**
 * Create a group course
 * Endpoint: POST /admin/v2/training-location/course/create
 */
export async function createGroupCourse(
  location: string,
  payload: CreateGroupCourseRequest
): Promise<CreateGroupCourseResponse | null> {
  try {
    const response = await apiClient.post<CreateGroupCourseResponse>(
      `/admin/v2/${location}/course/create`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating group course:", error);
    const apiError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errorCode?: string;
          success?: boolean;
        };
      };
    };
    const errorMessage = apiError.response?.data?.message || "Failed to create group course";
    const errorCode = apiError.response?.data?.errorCode;
    return {
      success: false,
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

export interface ReviewGroupCourseLessonResponse {
  success: boolean;
  data?: {
    courseId: number;
    program: string;
    teacher: string;
    period: string;
    time: string;
    lessons: Array<{
      id: number;
      date: string; // Format: "Jan 31, 2026 at 11:00 AM"
      duration: string;
      isHolidayConflict: boolean;
      isConflict: boolean;
      isUnscheduled: boolean;
    }>;
    summary: {
      holidayConflicted: number;
      conflicted: number;
      unscheduled: number;
      scheduled: number;
      total: number;
    };
  };
  message?: string;
  errorCode?: string;
}

/**
 * Review group course lessons
 * Endpoint: GET /admin/v2/training-location/course/review-lesson?courseId={courseId}
 */
export async function reviewGroupCourseLesson(
  location: string,
  courseId: number
): Promise<ReviewGroupCourseLessonResponse | null> {
  try {
    const response = await apiClient.get<ReviewGroupCourseLessonResponse>(
      `/admin/v2/${location}/course/review-lesson`,
      {
        params: {
          courseId: courseId.toString(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error reviewing group course lessons:", error);
    const apiError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errorCode?: string;
          success?: boolean;
        };
      };
    };
    const errorMessage = apiError.response?.data?.message || "Failed to review group course lessons";
    const errorCode = apiError.response?.data?.errorCode;
    return {
      success: false,
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

export interface ConfirmGroupCourseRequest {
  courseId: number;
}

export interface ConfirmGroupCourseResponse {
  success: boolean;
  data?: {
    courseId?: number;
  };
  message?: string;
  errorCode?: string;
}

/**
 * Confirm a group course
 * Endpoint: POST /admin/v2/{location}/course/confirm
 * 
 * @param location - The location identifier
 * @param courseId - The course ID to confirm
 * @returns Promise resolving to the confirm response or null on error
 */
export async function confirmGroupCourse(
  location: string,
  courseId: number
): Promise<ConfirmGroupCourseResponse | null> {
  try {
    const response = await apiClient.post<ConfirmGroupCourseResponse>(
      `/admin/v2/${location}/course/confirm`,
      { courseId }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error confirming group course:", error);
    const apiError = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          errorCode?: string;
          success?: boolean;
        };
      };
    };
    const errorMessage = apiError.response?.data?.message || "Failed to confirm group course";
    const errorCode = apiError.response?.data?.errorCode;
    return {
      success: false,
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}
