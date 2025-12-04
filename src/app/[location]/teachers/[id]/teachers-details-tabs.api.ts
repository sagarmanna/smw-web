import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Unavailability API Response Types
// ---------------------------------------------

export interface UnavailableHour {
  start: string;
  end: string;
  reason: string;
}

interface UnavailabilityApiResponseBody {
  unavailableHours: UnavailableHour[];
}

export interface UnavailabilityApiResponse {
  success: boolean;
  data: {
    body: UnavailabilityApiResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Students API Response Types
// ---------------------------------------------

export interface TeacherStudent {
  id: number;
  fullName: string;
}

interface StudentsApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentsApiResponse {
  success: boolean;
  data: {
    body: TeacherStudent[];
    pagination: StudentsApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// Unavailability API
// ---------------------------------------------

/**
 * Fetches unavailability data for a teacher
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/unavailability
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherUnavailability(
  location: string,
  teacherId: number
): Promise<UnavailableHour[] | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/unavailability`;
    const response = await apiClient.get<UnavailabilityApiResponse>(url);

    if (response.data.success && response.data.data?.body?.unavailableHours) {
      return response.data.data.body.unavailableHours;
    }

    return [];
  } catch (error: unknown) {
    console.error("Error fetching teacher unavailability:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher unavailability"
    );
    return null;
  }
}

// ---------------------------------------------
// Students API
// ---------------------------------------------

/**
 * Fetches students data for a teacher with pagination
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/students
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise resolving to students data with pagination or null on error
 */
export async function getTeacherStudents(
  location: string,
  teacherId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ students: TeacherStudent[]; pagination: StudentsApiResponsePagination } | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/students`;
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    
    const response = await apiClient.get<StudentsApiResponse>(url, { params });

    if (response.data.success && response.data.data?.body && Array.isArray(response.data.data.body)) {
      return {
        students: response.data.data.body,
        pagination: response.data.data.pagination,
      };
    }

    return {
      students: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching teacher students:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher students"
    );
    return null;
  }
}

// ---------------------------------------------
// Time Voucher API Response Types
// ---------------------------------------------

export interface TimeVoucherLesson {
  id: number;
  time: string;
  program: string;
  student: string;
  duration: number;
}

export interface TimeVoucherDetailItem {
  date: string;
  lessons: TimeVoucherLesson[];
  totalDuration?: number; // Total duration for this date group (provided by API)
}

export interface TimeVoucherSummaryItem {
  date: string;
  duration: number;
}

export interface TimeVoucherApiResponse {
  success: boolean;
  data: {
    body: TimeVoucherDetailItem[] | TimeVoucherSummaryItem[];
    footer?: {
      totalDuration: number;
    };
  };
  message?: string;
}

export interface TimeVoucherQueryParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  summaryOnly: boolean;
}

// ---------------------------------------------
// Time Voucher API
// ---------------------------------------------

/**
 * Fetches time voucher data for a teacher
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/time-voucher
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param params - Query parameters for filtering and summary mode
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherTimeVoucher(
  location: string,
  teacherId: number,
  params: TimeVoucherQueryParams
): Promise<TimeVoucherApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/time-voucher`;
    const response = await apiClient.get<TimeVoucherApiResponse>(url, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        summaryOnly: params.summaryOnly,
      },
    });

    if (response.data.success) {
      return response.data;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher time voucher:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher time voucher"
    );
    return null;
  }
}

// ---------------------------------------------
// Invoiced Lessons API Response Types
// ---------------------------------------------

export interface InvoicedLesson {
  invoiceDate: string;
  time: string;
  program: string;
  student: string;
  duration: number;
  rate: string;
  cost: string;
}

export interface InvoicedLessonDetailItem {
  invoiceDate: string;
  lessons: InvoicedLesson[];
  totalDuration?: number; // Total duration for this invoice date group (provided by API)
  totalCost?: string; // Total cost for this invoice date group (provided by API)
}

export interface InvoicedLessonSummaryItem {
  date: string;
  duration: number;
  cost: string;
}

export interface InvoicedLessonApiResponse {
  success: boolean;
  data: {
    body: InvoicedLessonDetailItem[] | InvoicedLessonSummaryItem[];
    totalCost?: string; // Overall total cost (directly in data, not in footer)
    totalDuration?: number; // Overall total duration (directly in data, not in footer)
  };
  message?: string;
}

export interface InvoicedLessonQueryParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  summaryOnly: boolean;
}

// ---------------------------------------------
// Invoiced Lessons API
// ---------------------------------------------

/**
 * Fetches invoiced lessons data for a teacher
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/invoiced-lessons
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param params - Query parameters for filtering and summary mode
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherInvoicedLessons(
  location: string,
  teacherId: number,
  params: InvoicedLessonQueryParams
): Promise<InvoicedLessonApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/invoiced-lessons`;
    const response = await apiClient.get<InvoicedLessonApiResponse>(url, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        summaryOnly: params.summaryOnly,
      },
    });

    if (response.data.success) {
      return response.data;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher invoiced lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher invoiced lessons"
    );
    return null;
  }
}

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface HistoryItem {
  id: number;
  message: string;
  createdOn: string;
}

export interface HistoryApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HistoryApiResponse {
  success: boolean;
  data: {
    body: HistoryItem[];
    pagination: HistoryApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// Comments API Response Types
// ---------------------------------------------

export interface CommentItem {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface CommentsApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsApiResponse {
  success: boolean;
  data: {
    body: CommentItem[];
    pagination: CommentsApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// History API
// ---------------------------------------------

/**
 * Fetches history data for a teacher
 * Endpoint: GET /admin/v2/{location}/history
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID (passed as id param with type=user)
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherHistory(
  location: string,
  teacherId: number
): Promise<HistoryApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/history`;
    const response = await apiClient.get<HistoryApiResponse>(url, {
      params: {
        type: 'user',
        id: teacherId.toString(),
      },
    });

    if (response.data.success) {
      return response.data;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher history"
    );
    return null;
  }
}

// ---------------------------------------------
// Comments API
// ---------------------------------------------

/**
 * Fetches comments data for a teacher
 * Endpoint: GET /admin/v2/{location}/comments
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID (passed as id param with type=user)
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getTeacherComments(
  location: string,
  teacherId: number
): Promise<CommentsApiResponse | null> {
  try {
    const url = `/admin/v2/${location}/comments`;
    const response = await apiClient.get<CommentsApiResponse>(url, {
      params: {
        type: 'user',
        id: teacherId.toString(),
      },
    });

    if (response.data.success) {
      return response.data;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher comments:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher comments"
    );
    return null;
  }
}

