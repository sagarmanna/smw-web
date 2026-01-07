import { apiClient } from '@/lib/api/client';

// PrivateLessonRow interface - matches API response structure directly
export interface PrivateLessonRow {
  id: number;
  date: string;
  student: string;
  program: string;
  teacher: string;
  duration: string;
  online: string; // "Yes" | "No"
  status: string; // "Scheduled" | "Completed" | etc.
  payment: string; // "Paid" | "Owing"
  price: string;
  classroom?: string; // Optional classroom name
}

// PrivateLessonsQuery interface for API queries
export type PrivateLessonStatusCode = "1" | "2" | "3" | "4" | "5" | "No";
export type OwingStatusCode = "1" | "3";
export type IsOnlineFlag = "1" | "0";

export interface PrivateLessonsQuery {
  page?: number;
  limit?: number;
  /**
   * Backend expects: YYYY-MM-DD (e.g. "2026-01-01")
   */
  fromDate?: string;
  /**
   * Backend expects: YYYY-MM-DD (e.g. "2026-02-28")
   */
  toDate?: string;
  student?: string;
  program?: string;
  teacher?: string;
  /**
   * Backend expects:
   * - 1 = online
   * - 0 = in-class
   * - omitted/empty = all
   */
  isOnline?: IsOnlineFlag;
  lessonStatus?: PrivateLessonStatusCode;
  owingStatus?: OwingStatusCode;
  showAll?: boolean;
  sort?: "dueDate" | "student" | "program" | "teacher";
  order?: "asc" | "desc";
}

interface PrivateLessonsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API response structure (current API returns `{ success, data: { body } }`;
// pagination/message may be present depending on backend version)
interface PrivateLessonsListApiResponse {
  success: boolean;
  message?: string;
  data: {
    body: PrivateLessonRow[];
    pagination?: PrivateLessonsPagination;
  };
}

// PrivateLessonsListResponse interface (internal representation)
export interface PrivateLessonsListResponse {
  success: boolean;
  message?: string;
  data: {
    body: PrivateLessonRow[];
    pagination?: PrivateLessonsPagination;
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 200,
  total: 0,
  totalPages: 1,
} as const;

const FETCH_ALL_LIMIT = 99999;

// Helper to build query parameters - DRY principle
const buildPrivateLessonsQueryParams = (query: PrivateLessonsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);
  if (query.student) params.append("student", query.student);
  if (query.program) params.append("program", query.program);
  if (query.teacher) params.append("teacher", query.teacher);
  if (query.isOnline) params.append("isOnline", query.isOnline);
  if (query.lessonStatus) params.append("lessonStatus", query.lessonStatus);
  if (query.owingStatus) params.append("owingStatus", query.owingStatus);
  if (typeof query.showAll === "boolean") params.append("showAll", query.showAll.toString());
  if (query.sort) {
    params.append("sort", query.sort);
    // Always include order when sort is provided
    // Use explicit order if provided, otherwise default to 'asc'
    const orderValue = query.order && query.order.trim() !== "" ? query.order : "asc";
    params.append("order", orderValue);
  }

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyPrivateLessonsResponse = (): PrivateLessonsListResponse => ({
  success: false,
  message: "Failed to fetch private lessons",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getPrivateLessonsList(
  location: string,
  query: PrivateLessonsQuery
): Promise<PrivateLessonsListResponse> {
  try {
    const params = buildPrivateLessonsQueryParams(query);

    const response = await apiClient.get<PrivateLessonsListApiResponse>(
      `/admin/v2/${location}/private-lessons/list`,
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
    const emptyResponse = createEmptyPrivateLessonsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch private lessons";
    return emptyResponse;
  }
}

