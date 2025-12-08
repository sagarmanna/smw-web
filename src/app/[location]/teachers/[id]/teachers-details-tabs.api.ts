import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Unavailability API Response Types
// ---------------------------------------------

export interface UnavailableHour {
  id: number;
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
// Unscheduled Lessons API Response Types
// ---------------------------------------------

export interface UnscheduledLessonApiItem {
  id: number;
  student: string;
  phone: string;
  program: string;
  programId?: number;
  duration: string;
  originalDate: string;
  expiryDate: string;
  teacher?: {
    id: number;
    title: string;
  };
}

interface UnscheduledLessonApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UnscheduledLessonApiResponse {
  success: boolean;
  data: {
    body: UnscheduledLessonApiItem[];
    pagination: UnscheduledLessonApiResponsePagination;
  };
  message?: string;
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

// ---------------------------------------------
// Unscheduled Lessons API
// ---------------------------------------------

/**
 * Fetches unscheduled lessons data for a teacher with pagination
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/unscheduled-lessons
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @param showAll - Whether to show all unscheduled lessons (default: false)
 * @returns Promise resolving to unscheduled lessons data with pagination or null on error
 */
export async function getTeacherUnscheduledLessons(
  location: string,
  teacherId: number,
  page: number = 1,
  limit: number = 10,
  showAll: boolean = false
): Promise<{ unscheduledLessons: UnscheduledLessonApiItem[]; pagination: UnscheduledLessonApiResponsePagination } | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/unscheduled-lessons`;
    const params: Record<string, string> = {};
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    if (showAll) params.showAll = "true";
    
    const response = await apiClient.get<UnscheduledLessonApiResponse>(url, { params });

    if (response.data.success && response.data.data?.body && Array.isArray(response.data.data.body)) {
      return {
        unscheduledLessons: response.data.data.body,
        pagination: response.data.data.pagination,
      };
    }

    return {
      unscheduledLessons: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching teacher unscheduled lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher unscheduled lessons"
    );
    return null;
  }
}

export interface InvoicedLessonQueryParams {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  summaryOnly: boolean;
}

// ---------------------------------------------
// Teacher Schedule API Response Types
// ---------------------------------------------

export interface TeacherScheduleLessonEvent {
  lessonId: number;
  isOwing: boolean | null;
  isOwingRentalAgreement: boolean | null;
  resourceId: number; // This is the teacherId in the API response
  title: string;
  start: string; // Format: "YYYY-MM-DD HH:mm:ss"
  end: string; // Format: "YYYY-MM-DD HH:mm:ss"
  url: string;
  className: string;
  backgroundColor: string;
  isOnline: boolean | number; // Can be boolean or 1/0
  programId: number | null;
}

export interface TeacherScheduleAvailabilityEvent {
  resourceId: number; // This is the teacherId in the API response
  start: string; // Format: "YYYY-MM-DD HH:mm:ss"
  end: string; // Format: "YYYY-MM-DD HH:mm:ss"
  rendering: string;
  className: string;
  backgroundColor: string;
}

export interface TeacherScheduleTimeRange {
  from: string; // Format: "HH:mm:ss"
  to: string; // Format: "HH:mm:ss"
}

export interface TeacherScheduleDateRange {
  from: string; // Format: "YYYY-MM-DD"
  to: string; // Format: "YYYY-MM-DD"
}

export interface TeacherScheduleData {
  lessons: TeacherScheduleLessonEvent[];
  availability: TeacherScheduleAvailabilityEvent[];
  time: TeacherScheduleTimeRange;
  date: TeacherScheduleDateRange;
  totalEvents: number;
  teacherId: number;
}

export interface TeacherScheduleApiResponse {
  success: boolean;
  data: {
    body: TeacherScheduleData;
  };
  message?: string;
}

/**
 * Fetches teacher schedule events
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/schedule-events
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param date - Optional date string (YYYY-MM-DD) to get schedule for that week
 * @param showAll - Optional boolean to show all hours (location visibility)
 * @returns Promise resolving to teacher schedule data or null on error
 */
export async function getTeacherScheduleEvents(
  location: string,
  teacherId: number,
  date?: string,
  showAll: boolean = false
): Promise<TeacherScheduleData | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/schedule-events`;
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (showAll) params.showAll = showAll.toString();
    
    const response = await apiClient.get<TeacherScheduleApiResponse>(url, { params });

    if (response.data.success && response.data.data?.body) {
      return response.data.data.body;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher schedule events:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher schedule events"
    );
    return null;
  }
}

// ---------------------------------------------
// Teacher Availability API Response Types
// ---------------------------------------------

// Reuse the same types as schedule-events since the structure is identical
export interface TeacherAvailabilityApiResponse {
  success: boolean;
  data: {
    body: TeacherScheduleData;
  };
  message?: string;
}

/**
 * Fetches teacher availability
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/availability
 * @param location - The location identifier (e.g., "burlington")
 * @param teacherId - The teacher ID
 * @param date - Optional date string (YYYY-MM-DD) to get availability for that week
 * @returns Promise resolving to teacher availability data or null on error
 */
export async function getTeacherAvailability(
  location: string,
  teacherId: number,
  date?: string
): Promise<TeacherScheduleData | null> {
  try {
    const url = `/admin/v2/${location}/teachers/${teacherId}/availability`;
    const params: Record<string, string> = {};
    if (date) params.date = date;
    
    const response = await apiClient.get<TeacherAvailabilityApiResponse>(url, { params });

    if (response.data.success && response.data.data?.body) {
      return response.data.data.body;
    }

    return null;
  } catch (error: unknown) {
    console.error("Error fetching teacher availability:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch teacher availability"
    );
    return null;
  }
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

