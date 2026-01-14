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
