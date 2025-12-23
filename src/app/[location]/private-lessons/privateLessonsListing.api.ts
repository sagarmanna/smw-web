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
export interface PrivateLessonsQuery {
  page?: number;
  limit?: number;
  dateFrom?: string; // Date range filter for date
  dateTo?: string;
  student?: string;
  program?: string;
  teacher?: string;
  duration?: string;
  online?: string;
  status?: string;
  payment?: string;
  price?: string;
  sort?: "date" | "student" | "program" | "teacher";
  order?: "asc" | "desc";
}

// API response structure
interface PrivateLessonsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: PrivateLessonRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// PrivateLessonsListResponse interface (internal representation)
export interface PrivateLessonsListResponse {
  success: boolean;
  message: string;
  data: {
    body: PrivateLessonRow[];
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
const buildPrivateLessonsQueryParams = (query: PrivateLessonsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.dateFrom) params.append("dateFrom", query.dateFrom);
  if (query.dateTo) params.append("dateTo", query.dateTo);
  if (query.student) params.append("student", query.student);
  if (query.program) params.append("program", query.program);
  if (query.teacher) params.append("teacher", query.teacher);
  if (query.duration) params.append("duration", query.duration);
  if (query.online) params.append("online", query.online);
  if (query.status) params.append("status", query.status);
  if (query.payment) params.append("payment", query.payment);
  if (query.price) params.append("price", query.price);
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
      `/admin/v2/${location}/user/list/private-lessons`,
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

