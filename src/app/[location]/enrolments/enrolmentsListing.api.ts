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
  autoRenewal?: string; // "all" | "Enabled" | "Disabled"
  lessonsRemaining?: string; // Filter for lessons remaining (can be number as string)
  startDateFrom?: string; // Date range filter for start date
  startDateTo?: string;
  endDateFrom?: string; // Date range filter for end date
  endDateTo?: string;
  showActive?: boolean;
  showInActive?: boolean;
  showAll?: boolean;
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
  
  // Map autoRenewal to isAutoRenewal (handle "all" value)
  if (query.autoRenewal) {
    const isAutoRenewalValue = query.autoRenewal === "all" ? "all" : query.autoRenewal;
    params.append("isAutoRenewal", isAutoRenewalValue);
  } else {
    params.append("isAutoRenewal", "all");
  }
  
  // Map date range filters
  if (query.startDateFrom) params.append("startFrom", query.startDateFrom);
  if (query.startDateTo) params.append("startTo", query.startDateTo);
  if (query.endDateFrom) params.append("endFrom", query.endDateFrom);
  if (query.endDateTo) params.append("endTo", query.endDateTo);
  
  // Lessons remaining filter
  if (query.lessonsRemaining !== undefined) {
    params.append("lessonsRemaining", query.lessonsRemaining);
  }
  
  // Show filters (active/inactive/all) - always include with default "false"
  const showFilters: Array<{ key: string; value: boolean | undefined }> = [
    { key: "showActive", value: query.showActive },
    { key: "showInActive", value: query.showInActive },
    { key: "showAll", value: query.showAll },
  ];
  showFilters.forEach(({ key, value }) => {
    params.append(key, (value !== undefined ? value : false).toString());
  });
  
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
      `/admin/v2/${location}/enrolments/list`,
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


