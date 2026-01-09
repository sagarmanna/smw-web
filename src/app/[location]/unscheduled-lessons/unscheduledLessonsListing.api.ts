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
  showAll?: boolean;
  showInactive?: boolean;
}

type UnscheduledLessonsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// API response structure
interface UnscheduledLessonsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: UnscheduledLessonRow[];
    pagination?: UnscheduledLessonsPagination;
  };
}

// UnscheduledLessonsListResponse interface (internal representation)
export interface UnscheduledLessonsListResponse {
  success: boolean;
  message: string;
  data: {
    body: UnscheduledLessonRow[];
    pagination: UnscheduledLessonsPagination;
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

const getRequestedPagination = (query: UnscheduledLessonsQuery) => {
  // showAll=true means "return all items without pagination".
  // Also treat limit=-1 (rows-per-page "All") as fetch-all mode.
  const fetchAll = query.showAll === true || query.limit === -1;

  const page = fetchAll ? 1 : (query.page ?? DEFAULT_PAGINATION.page);
  const limit = fetchAll ? FETCH_ALL_LIMIT : (query.limit ?? DEFAULT_PAGINATION.limit);
  const showAll = fetchAll; // Ensure backend gets showAll=true in fetch-all mode

  return { fetchAll, page, limit, showAll };
};

// Helper to build query parameters - DRY principle
const buildUnscheduledLessonsQueryParams = (query: UnscheduledLessonsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  const { page, limit, showAll } = getRequestedPagination(query);

  params.append("page", page.toString());
  params.append("limit", limit.toString());
  // Backend expects these keys even when values are empty
  params.append("student", query.student ?? "");
  params.append("program", query.program ?? "");
  params.append("teacher", query.teacher ?? "");

  const showInactive = typeof query.showInactive === "boolean" ? query.showInactive : false;

  params.append("showAll", showAll.toString());
  params.append("showInactive", showInactive.toString());

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
      `/admin/v2/${location}/unscheduled-lessons/list`,
      { params }
    );

    const { page, limit } = getRequestedPagination(query);
    const safePagination: UnscheduledLessonsPagination = response.data.data.pagination ?? {
      ...DEFAULT_PAGINATION,
      page,
      limit,
      total: response.data.data.body.length,
      totalPages: 1,
    };

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: response.data.data.body,
        pagination: safePagination,
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
