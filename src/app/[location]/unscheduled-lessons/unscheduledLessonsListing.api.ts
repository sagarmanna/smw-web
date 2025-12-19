import { apiClient } from '@/lib/api/client';

// UnscheduledLessonRow interface - matches API response structure directly
export interface UnscheduledLessonRow {
  id: number;
  student: string;
  program: string;
  teacher: string;
  duration: string;
  date: string;
  expiryDate: string;
}

// UnscheduledLessonsQuery interface for API queries
export interface UnscheduledLessonsQuery {
  page?: number;
  limit?: number;
  student?: string;
  program?: string;
  teacher?: string;
}

// API response structure
interface UnscheduledLessonsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: UnscheduledLessonRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// UnscheduledLessonsListResponse interface (internal representation)
export interface UnscheduledLessonsListResponse {
  success: boolean;
  message: string;
  data: {
    body: UnscheduledLessonRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

const FETCH_ALL_LIMIT = 99999;

// Helper to build query parameters - DRY principle
const buildUnscheduledLessonsQueryParams = (query: UnscheduledLessonsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.student) params.append("student", query.student);
  if (query.program) params.append("program", query.program);
  if (query.teacher) params.append("teacher", query.teacher);

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyUnscheduledLessonsResponse = (): UnscheduledLessonsListResponse => ({
  success: false,
  message: "Failed to fetch unscheduled lessons",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getUnscheduledLessonsList(
  location: string,
  query: UnscheduledLessonsQuery
): Promise<UnscheduledLessonsListResponse> {
  try {
    const params = buildUnscheduledLessonsQueryParams(query);

    const response = await apiClient.get<UnscheduledLessonsListApiResponse>(
      `/admin/v2/${location}/user/list/unscheduled-lesson`,
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
    const emptyResponse = createEmptyUnscheduledLessonsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch unscheduled lessons";
    return emptyResponse;
  }
}
