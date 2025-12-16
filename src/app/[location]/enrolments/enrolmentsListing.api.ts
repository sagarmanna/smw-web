import { apiClient } from '@/lib/api/client';

// EnrolmentRow interface - matches API response structure directly
export interface EnrolmentRow {
  id: number;
  program: string;
  student: string;
  teacher: string;
  autoRenewal: string; // "Enabled" | "Disabled"
  startDate: string;
  endDate: string;
  lessonsRemaining: number;
}

// EnrolmentsQuery interface for API queries
export interface EnrolmentsQuery {
  page?: number;
  limit?: number;
  program?: string;
  student?: string;
  teacher?: string;
  autoRenewal?: string;
  lessonsRemaining?: string; // Filter for lessons remaining (can be number as string)
  startDateFrom?: string; // Date range filter for start date
  startDateTo?: string;
  endDateFrom?: string; // Date range filter for end date
  endDateTo?: string;
  sort?: "program" | "student" | "teacher" | "startDate" | "endDate" | "lessonsRemaining";
  order?: "asc" | "desc";
}

// API response structure
interface EnrolmentsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: EnrolmentRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// EnrolmentsListResponse interface (internal representation)
export interface EnrolmentsListResponse {
  success: boolean;
  message: string;
  data: {
    body: EnrolmentRow[];
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
const buildEnrolmentsQueryParams = (query: EnrolmentsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.program) params.append("program", query.program);
  if (query.student) params.append("student", query.student);
  if (query.teacher) params.append("teacher", query.teacher);
  if (query.autoRenewal) params.append("autoRenewal", query.autoRenewal);
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
const createEmptyEnrolmentsResponse = (): EnrolmentsListResponse => ({
  success: false,
  message: "Failed to fetch enrolments",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getEnrolmentsList(
  location: string,
  query: EnrolmentsQuery
): Promise<EnrolmentsListResponse> {
  try {
    const params = buildEnrolmentsQueryParams(query);

    const response = await apiClient.get<EnrolmentsListApiResponse>(
      `/admin/v2/${location}/user/list/enrolment`,
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
    const emptyResponse = createEmptyEnrolmentsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch enrolments";
    return emptyResponse;
  }
}


