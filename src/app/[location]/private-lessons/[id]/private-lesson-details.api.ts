import { apiClient } from "@/lib/api/client";
import type { PrivateLessonInfo } from "../types";

/**
 * Normalizes dueDate from API response to a displayable string.
 * API returns dueDate as an object: { dueDate: "Dec 15, 2025" }
 * This function extracts the string value from the nested object structure.
 * 
 * @param value - The dueDate value from API response (object format: { dueDate: string })
 * @returns Normalized string value or empty string if invalid/missing
 */
function normalizeDueDate(value: unknown): string {
  // API always returns object format: { dueDate: "Dec 15, 2025" }
  if (value && typeof value === "object" && value !== null && "dueDate" in value) {
    const nestedValue = (value as { dueDate?: unknown }).dueDate;
    return typeof nestedValue === "string" ? nestedValue : "";
  }
  
  // Return empty string for null, undefined, or invalid values
  return "";
}

// API Response Types - supports both nested (lesson/student) and flat structures
export interface PrivateLessonDetailsResponseBody {
  // New nested structure (from actual API)
  lesson?: {
    id: number;
    programId?: number;
    programName: string;
    classroomName: string;
    status: string;
    colorCode: string;
    isOnline: string; // "Yes" | "No"
    isPrivate?: boolean;
    isGroup?: boolean;
  };
  student?: {
    studentId: number;
    customerId: number;
    studentName: string;
    customerName: string;
    phoneNumber: string;
  };
  // Legacy/flat structure (for backward compatibility with mock data)
  id?: number;
  program?: string;
  classroom?: string;
  status?: string;
  colorCode?: string;
  online?: string; // "Yes" | "No"
  studentName?: string; // Legacy flat student name
  studentId?: number;
  customer?: string;
  customerId?: number;
  phone?: string;
  attendance?: {
    present: string; // "Yes" | "No"
  };
  cost?: {
    costPerHour: string;
    cost: string;
    price: string;
    profit: string;
    costPerStudent?: string;
  };
  schedule?: {
    teacher: string;
    teacherId?: number;
    originalDate?: string;
    scheduledDate: string;
    time: string;
    duration: string;
    expiryDate: string;
  };
  dueDate?: { dueDate: string } | string; // API returns object format: { dueDate: "Dec 15, 2025" }, but keeping string for backward compatibility
  totals?: {
    lessonRatePerHour: string;
    qty: string;
    lessonPrice: string;
    discount: string;
    subTotal: string;
    tax: string;
    total: string;
    paid: string;
    balance: string;
    invoiceId?: number;
    invoiceNumber?: string;
    invoiceOwing?: string;
  };
  // Group lesson specific fields (when isGroup: true)
  // Note: Students data may come from a separate API call
  students?: Array<{
    id: number;
    groupLessonId?: number;
    lessonId?: number;
    enrolmentId?: number;
    studentId?: number;
    studentName: string;
    customerName: string;
    dueDate: string;
    grossPrice: string;
    discount: string;
    netPrice: string;
    owing: string;
    hasInvoice?: boolean;
    invoiceId?: number;
    hasPayment?: boolean;
  }>;
  costPerStudent?: string;
}

export interface PrivateLessonDetailsApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonDetailsResponseBody;
  };
  message?: string;
}

// Payments API Response Types
export interface PrivateLessonPaymentResponseBody {
  id: number;
  date: string;
  paymentMethod: string;
  number: string;
  amount: string;
}

export interface PrivateLessonPaymentsApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonPaymentResponseBody[];
  };
  message?: string;
}

// History API Response Types
export interface PrivateLessonHistoryResponseBody {
  id: number;
  createdOn: string;
  message: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PrivateLessonHistoryApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonHistoryResponseBody[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

/**
 * Fetches detailed private lesson information from the API
 * For now, returns mock data
 * 
 * @param location - The location identifier
 * @param privateLessonId - The private lesson ID
 * @returns Promise resolving to the private lesson details response or null on error
 */
export async function getPrivateLessonDetails(
  location: string,
  privateLessonId: string
): Promise<PrivateLessonDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonDetailsApiResponse>(
      `/admin/v2/${location}/lesson/details/${privateLessonId}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching private lesson details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          id: Number(privateLessonId) || 0,
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch private lesson details",
    };
  }
}

// Group Lesson Students API Response Types
export interface GroupLessonStudentResponseBody {
  id?: number;
  groupLessonId?: number;
  lessonId?: number;
  enrolmentId?: number;
  studentId?: number;
  studentName: string;
  customerName: string;
  dueDate: string;
  grossPrice: string;
  discount: string;
  netPrice: string;
  owing: string;
  hasInvoice?: boolean;
  invoiceId?: number;
  hasPayment?: boolean;
}

export interface GroupLessonStudentsApiResponse {
  success: boolean;
  data: {
    body: GroupLessonStudentResponseBody[];
  };
  message?: string;
}

/**
 * Fetches group lesson students from the API
 * This is called separately for group lessons (when isGroup: true)
 * 
 * @param location - The location identifier
 * @param lessonId - The lesson ID
 * @returns Promise resolving to the students response or null on error
 */
export async function getGroupLessonStudents(
  location: string,
  lessonId: string
): Promise<GroupLessonStudentsApiResponse | null> {
  try {
    const response = await apiClient.get<GroupLessonStudentsApiResponse>(
      `/admin/v2/${location}/lesson/details/${lessonId}/group-students`
    );

    if (!response.data.success) {
      return response.data;
    }

    if (!response.data.data?.body) {
      console.error("Group lesson students API returned no body:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching group lesson students:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch group lesson students",
    };
  }
}

// Update Group Lesson Student Discount API Types
export interface UpdateGroupLessonStudentDiscountRequest {
  discount: string;
}

export interface UpdateGroupLessonStudentDiscountResponse {
  success: boolean;
  data: {
    studentId: number;
    discount: string;
  };
  message?: string;
}

/**
 * Updates a group lesson student's discount via API.
 * For now, returns mock response.
 */
export async function updateGroupLessonStudentDiscount(
  location: string,
  lessonId: string,
  studentId: number,
  data: UpdateGroupLessonStudentDiscountRequest
): Promise<UpdateGroupLessonStudentDiscountResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        studentId,
        discount: data.discount,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating group lesson student discount:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: { studentId, discount: "" },
      message: apiError.response?.data?.message || "Failed to update student discount",
    };
  }
}

/**
 * Fetches private lesson payments from the API
 *
 * Endpoint: GET /admin/v2/{location}/private-lesson/payment/{privateLessonId}
 * Query params: sort=amount, order=DESC|ASC
 *
 * @param location - The location identifier
 * @param privateLessonId - The private lesson ID
 * @param sort - The sort field (default: "amount")
 * @param order - The sort direction (default: "DESC")
 * @returns Promise resolving to the payments response or null on error
 */
export async function getPrivateLessonPayments(
  location: string,
  privateLessonId: string,
  sort: string = "amount",
  order: "ASC" | "DESC" = "DESC"
): Promise<PrivateLessonPaymentsApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonPaymentsApiResponse>(
      `/admin/v2/${location}/private-lesson/payment/${privateLessonId}`,
      {
        params: { sort, order },
      }
    );

    if (!response.data.success) {
      return response.data;
    }

    if (!response.data.data?.body) {
      console.error("Private lesson payments API returned no body:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching private lesson payments:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch private lesson payments",
    };
  }
}

/**
 * Fetches group lesson payments for a specific enrolment from the API.
 *
 * Endpoint: GET /admin/v2/{location}/lesson/details/{lessonId}/payments
 * Query params: enrolmentId, sort, order
 *
 * @param location - The location identifier
 * @param lessonId - The lesson ID
 * @param enrolmentId - The enrolment ID
 * @param sort - Optional sort field (for example: "amount")
 * @param order - Optional sort direction ("asc" | "desc")
 */
export async function getGroupLessonPayments(
  location: string,
  lessonId: string,
  enrolmentId: string,
  sort?: string,
  order?: "asc" | "desc"
): Promise<PrivateLessonPaymentsApiResponse | null> {
  try {
    const params: Record<string, string> = { enrolmentId };
    if (sort) {
      params.sort = sort;
    }
    if (sort && order) {
      params.order = order;
    }

    const response = await apiClient.get<PrivateLessonPaymentsApiResponse>(
      `/admin/v2/${location}/lesson/details/${lessonId}/payments`,
      { params }
    );

    if (!response.data.success) {
      return response.data;
    }

    if (!response.data.data?.body) {
      console.error("Group lesson payments API returned no body:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching group lesson payments:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch group lesson payments",
    };
  }
}

/**
 * Fetches private lesson history from the API with pagination.
 *
 * Endpoint: GET /admin/v2/{location}/history?type=lesson&id={privateLessonId}&page={page}
 *
 * @param location - The location identifier
 * @param privateLessonId - The private lesson ID
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to the history response or null on error
 */
export async function getPrivateLessonHistory(
  location: string,
  privateLessonId: string,
  page: number = 1
): Promise<PrivateLessonHistoryApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonHistoryApiResponse>(
      `/admin/v2/${location}/history`,
      {
        params: {
          type: "lesson",
          id: privateLessonId,
          page,
        },
      }
    );

    // If API indicates failure (even with 200), pass that back so callers can surface the message
    if (!response.data.success) {
      return response.data;
    }

    // Ensure we always have a body for downstream consumers
    if (!response.data.data?.body) {
      console.error("Private lesson history API returned no body:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching private lesson history:", error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          success?: boolean;
        };
      };
    };

    const errorMessage = apiError.response?.data?.message || "Failed to fetch private lesson history";

    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      },
      message: errorMessage,
    };
  }
}

// Email statement API types -------------------------------------------------
export interface PrivateLessonEmailStatementBody {
  lesson: {
    student: string;
    customer: string;
    teacher: string;
    scheduledDate: string;
    time: string;
    duration: string;
    status: string;
    expiryDate: string;
    rescheduleStatement?: string;
  };
  // some endpoints may also return a list of recipient emails
  emails?: string[];
  // when the API returns an emailTemplate at the top level we merge it in
  emailTemplate?: {
    id: number;
    to: string;
    subject: string;
    header: string;
    footer: string;
  };
}

export interface PrivateLessonEmailStatementApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonEmailStatementBody;
    // some responses (newer) return the template alongside the body
    emailTemplate?: {
      id: number;
      to: string;
      subject: string;
      header: string;
      footer: string;
    };
  };
  message?: string;
}

/**
 * Fetches private lesson email statement from the API.
 *
 * Endpoint: GET /admin/v2/{location}/lesson/{privateLessonId}/email-statement
 */
export async function getPrivateLessonEmailStatement(
  location: string,
  privateLessonId: string
): Promise<PrivateLessonEmailStatementApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonEmailStatementApiResponse>(
      `/admin/v2/${location}/lesson/${privateLessonId}/email-statement`
    );

    if (!response.data.success || !response.data.data?.body) {
      // if the call failed we propagate the data (so UI can show message) or null
      return response.data.success === false ? response.data : null;
    }

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          lesson: {
            student: "",
            customer: "",
            teacher: "",
            scheduledDate: "",
            time: "",
            duration: "",
            status: "",
            expiryDate: "",
            rescheduleStatement: "",
          },
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch email statement",
    };
  }
}

/**
 * Transforms API response to match the PrivateLessonInfo interface
 */
export function transformApiResponse(
  apiResponse: PrivateLessonDetailsApiResponse,
  paymentsResponse: PrivateLessonPaymentsApiResponse | null,
  historyResponse: PrivateLessonHistoryApiResponse | null,
  commentsResponse: PrivateLessonCommentsApiResponse | null,
  groupStudentsResponse?: GroupLessonStudentsApiResponse | null
): PrivateLessonInfo {
  const { body } = apiResponse.data;
  
  // Handle both nested structure (lesson/student) and flat structure
  const lessonData = body.lesson;
  const studentData = body.student;
  
  // Extract customerId from nested student object if available, otherwise from flat structure
  const customerId = (studentData && typeof studentData === 'object' && 'customerId' in studentData && typeof studentData.customerId === 'number') 
    ? studentData.customerId 
    : (body.customerId ?? undefined);
  const studentId = (studentData && typeof studentData === 'object' && 'studentId' in studentData && typeof studentData.studentId === 'number')
    ? studentData.studentId
    : (body.studentId ?? undefined);
  const studentName = (studentData && typeof studentData === 'object' && 'studentName' in studentData)
    ? String(studentData.studentName)
    : (body.studentName || '');
  const customerName = (studentData && typeof studentData === 'object' && 'customerName' in studentData)
    ? String(studentData.customerName)
    : (body.customer || '');
  const phone = (studentData && typeof studentData === 'object' && 'phoneNumber' in studentData)
    ? String(studentData.phoneNumber)
    : (body.phone || '');
  
  // Convert online string "Yes"/"No" to boolean
  const onlineString = (lessonData && 'isOnline' in lessonData) 
    ? lessonData.isOnline 
    : (body.online ?? "No");
  const onlineBoolean = onlineString === "Yes";
  
  // Extract isGroup and isPrivate from lesson data
  const isGroup = lessonData?.isGroup ?? false;
  const isPrivate = lessonData?.isPrivate ?? false;
  
  // Debug logging
  console.log('[transformApiResponse] Lesson flags:', {
    'lessonData': lessonData,
    'lessonData?.isGroup': lessonData?.isGroup,
    'lessonData?.isPrivate': lessonData?.isPrivate,
    'isGroup': isGroup,
    'isPrivate': isPrivate
  });
  
  // Convert attendance present string "Yes"/"No" to boolean
  const attendancePresent = body.attendance?.present === "Yes";

  // Normalize dueDate to a displayable string using utility function
  const normalizedDueDate = normalizeDueDate(body.dueDate);
  
  // Get payments from API response
  const paymentsBody = paymentsResponse?.data?.body || [];
  const payments = paymentsBody.map((item) => ({
    id: item.id,
    date: item.date || "",
    paymentMethod: item.paymentMethod || "",
    number: item.number || "",
    amount: item.amount || "",
  }));
  
  // Get history from API response
  const historyBody = historyResponse?.data?.body || [];
  const history = historyBody.map((item) => ({
    id: item.id,
    message: item.message || "",
    createdOn: item.createdOn || "",
  }));

  // Get comments from API response
  const commentsBody = commentsResponse?.data?.body || [];
  const comments = commentsBody.map((item) => ({
    id: item.id,
    content: item.content || "",
    createdUser: item.createdUser || "",
    avatar: item.avatar || "",
    createdOn: item.createdOn || "",
  }));
  
  // Get group lesson students (from separate API call if provided, otherwise from body)
  const studentsBody = groupStudentsResponse?.data?.body || body.students || [];
  const students = studentsBody.map((student) => ({
    id: student.groupLessonId || student.id || 0,
    lessonId: student.lessonId,
    enrolmentId: student.enrolmentId,
    studentId: student.studentId,
    studentName: student.studentName || "",
    customerName: student.customerName || "",
    dueDate: student.dueDate || "",
    grossPrice: student.grossPrice || "",
    discount: student.discount || "",
    netPrice: student.netPrice || "",
    owing: student.owing || "",
    hasInvoice: student.hasInvoice ?? false,
    invoiceId: student.invoiceId,
    hasPayment: student.hasPayment ?? false,
  }));

  // Get group cost data (if isGroup: true)
  const groupCost = isGroup ? {
    costPerHour: body.cost?.costPerHour || "",
    cost: body.cost?.cost || "",
    costPerStudent: body.cost?.costPerStudent || body.costPerStudent || "",
  } : undefined;
  
  return {
    details: {
      id: (lessonData?.id ?? body.id) || 0,
      programId: lessonData?.programId,
      program: (lessonData?.programName ?? body.program) || "",
      classroom: (lessonData?.classroomName ?? body.classroom) || "",
      status: (lessonData?.status ?? body.status) || "",
      colorCode: (lessonData?.colorCode ?? body.colorCode) || "",
      online: onlineBoolean,
      student: studentName,
      studentId: studentId,
      customer: customerName,
      customerId: customerId,
      phone: phone,
      isGroup: isGroup,
      isPrivate: isPrivate,
      attendance: {
        present: attendancePresent,
      },
      cost: {
        costPerHour: body.cost?.costPerHour || "",
        cost: body.cost?.cost || "",
        price: body.cost?.price || "",
        profit: body.cost?.profit || "",
      },
      schedule: {
        teacher: body.schedule?.teacher || "",
        teacherId: body.schedule?.teacherId,
        originalDate: body.schedule?.originalDate || "",
        scheduledDate: body.schedule?.scheduledDate || "",
        time: body.schedule?.time || "",
        duration: body.schedule?.duration || "",
        expiryDate: body.schedule?.expiryDate || "",
      },
      dueDate: normalizedDueDate,
      totals: {
        lessonRatePerHour: body.totals?.lessonRatePerHour || "",
        qty: body.totals?.qty || "",
        lessonPrice: body.totals?.lessonPrice || "",
        discount: body.totals?.discount || "",
        subTotal: body.totals?.subTotal || "",
        tax: body.totals?.tax || "",
        total: body.totals?.total || "",
        paid: body.totals?.paid || "",
        balance: body.totals?.balance || "",
        invoiceId: body.totals?.invoiceId,
        invoiceNumber: body.totals?.invoiceNumber || "",
        invoiceOwing: body.totals?.invoiceOwing || "",
      },
    },
    payments: payments,
    history: history, // History is fetched separately with pagination
    comments: comments,
    students: students, // Group lesson students
    groupCost: groupCost, // Group lesson cost data
  };
}

// Update Private Lesson Details API Types
export interface UpdatePrivateLessonDetailsRequest {
  classroomId?: number;
  colorCode?: string;
  isOnline?: boolean;
}

interface UpdatePrivateLessonDetailsApiResponse {
  success: boolean;
  data: {
    id: number;
    classroomId: number;
    colorCode: string;
    isOnline: string; // "Yes" | "No"
  };
  message?: string;
}

export interface UpdatePrivateLessonDetailsResponse {
  success: boolean;
  data: {
    id: number;
    classroomId: number;
    colorCode: string;
    isOnline: string; // "Yes" | "No"
  };
  message?: string;
}

/**
 * Updates private lesson details via PUT API.
 * PUT /admin/v2/{location}/lesson/details/{privateLessonId}
 */
export async function updatePrivateLessonDetails(
  location: string,
  privateLessonId: string,
  data: UpdatePrivateLessonDetailsRequest
): Promise<UpdatePrivateLessonDetailsResponse | null> {
  const response = await apiClient.put<UpdatePrivateLessonDetailsApiResponse>(
    `/admin/v2/${location}/lesson/details/${privateLessonId}`,
    data
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to update lesson details"
    );
  }

  return {
    success: true,
    data: body.data,
    message,
  };
}

// Update Attendance API Types
export interface UpdateAttendanceRequest {
  present: boolean;
}

export interface UpdateAttendanceResponse {
  success: boolean;
  data: {
    id: number;
    present: boolean;
  };
  message?: string;
}

/**
 * Updates attendance via PUT API.
 * PUT /admin/v2/{location}/lesson/{privateLessonId}/attendance
 */
export async function updateAttendance(
  location: string,
  privateLessonId: string,
  data: UpdateAttendanceRequest
): Promise<UpdateAttendanceResponse | null> {
  const response = await apiClient.put<UpdateAttendanceResponse>(
    `/admin/v2/${location}/lesson/${privateLessonId}/attendance`,
    data
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to update attendance"
    );
  }

  return {
    success: true,
    data: body.data,
    message,
  };
}

// Update Cost API Types
export interface UpdateCostRequest {
  teacherRate: number;
}

export interface UpdateCostResponse {
  success: boolean;
  data: {
    costPerHour: string;
    cost: string;
    price: string;
    profit: string;
  };
  message?: string;
}

/**
 * Updates teacher cost via PUT /admin/v2/{location}/lesson/{id}/edit-cost
 * Request: { teacherRate: number }
 * Response: { costPerHour, cost, price, profit }
 */
export async function updateCost(
  location: string,
  privateLessonId: string,
  data: UpdateCostRequest
): Promise<UpdateCostResponse | null> {
  try {
    const response = await apiClient.put<UpdateCostResponse>(
      `/admin/v2/${location}/lesson/${privateLessonId}/edit-cost`,
      { teacherRate: data.teacherRate }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating cost:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: { costPerHour: "", cost: "", price: "", profit: "" },
      message: apiError.response?.data?.message || "Failed to update cost",
    };
  }
}

// Update Due Date API Types
export interface UpdateDueDateRequest {
  dueDate: string;
}

export interface UpdateDueDateResponse {
  success: boolean;
  data: {
    id: number;
    dueDate: string;
  };
  message?: string;
}

/**
 * Updates due date via PUT API
 * For now, returns mock response
 */
export async function updateDueDate(
  location: string,
  privateLessonId: string,
  data: UpdateDueDateRequest
): Promise<UpdateDueDateResponse | null> {
  try {
    const response = await apiClient.put<UpdateDueDateResponse>(
      `/admin/v2/${location}/lesson/${privateLessonId}/due-date`,
      data
    );

    const body = response.data;
    if (!body || body.success !== true) {
      return body;
    }

    // Ensure we return a normalized object
    return {
      success: true,
      data: {
        id: body.data?.id ?? Number(privateLessonId) ?? 0,
        dueDate: body.data?.dueDate ?? data.dueDate,
      },
      message: body.message,
    };
  } catch (error: unknown) {
    console.error("Error updating due date:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        dueDate: "",
      },
      message: apiError.response?.data?.message || "Failed to update due date",
    };
  }
}

// Update Discount API Types
export interface UpdateDiscountRequest {
  discount: string;
}

export interface UpdateDiscountResponse {
  success: boolean;
  data: {
    id: number;
    discount: string;
  };
  message?: string;
}

/**
 * Updates discount via PUT API
 * For now, returns mock response
 */
export async function updateDiscount(
  location: string,
  privateLessonId: string,
  data: UpdateDiscountRequest
): Promise<UpdateDiscountResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        discount: data.discount,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating discount:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        discount: "",
      },
      message: apiError.response?.data?.message || "Failed to update discount",
    };
  }
}

// Update Price (Lesson Rate) API Types
export interface UpdatePriceRequest {
  id: number;
  programRate: number;
}

export interface UpdatePriceResponse {
  success: boolean;
  data: {
    body: {
      programRate: number;
    };
  };
  message?: string;
}

/**
 * Updates lesson rate per hour via PUT API.
 * PUT /admin/v2/{location}/private-lesson/edit-price
 */
export async function updatePrice(
  location: string,
  _privateLessonId: string,
  data: UpdatePriceRequest
): Promise<UpdatePriceResponse | null> {
  const response = await apiClient.put<UpdatePriceResponse>(
    `/admin/v2/${location}/private-lesson/edit-price`,
    data
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to update price"
    );
  }

  return {
    success: true,
    data: body.data,
    message,
  };
}

// Comments API Response Types
export interface PrivateLessonCommentResponseBody {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface PrivateLessonCommentsApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonCommentResponseBody[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

export interface CreatePrivateLessonCommentRequest {
  content: string;
}

export interface GeneratePrivateLessonInvoiceResponse {
  success: boolean;
  data?: {
    status?: boolean | number | string | null;
    message?: string;
    customerId?: number;
    invoiceId?: number;
    legacyRedirectUrl?: string;
    url?: string;
  };
  message?: string;
}

function isSuccessfulInvoiceStatus(status: unknown): boolean {
  const normalized = status?.toString?.()?.trim?.()?.toLowerCase?.();
  return (
    status === undefined ||
    status === null ||
    status === true ||
    status === 1 ||
    normalized === "true" ||
    normalized === "1"
  );
}

/**
 * Fetches private lesson comments from the API
 *
 * Endpoint: GET /admin/v2/{location}/comments?id={lessonId}&type=lesson&page={page}
 *
 * @param location - The location identifier
 * @param lessonId - The lesson ID
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to the comments response or null on error
 */
export async function getPrivateLessonComments(
  location: string,
  lessonId: string,
  page: number = 1
): Promise<PrivateLessonCommentsApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonCommentsApiResponse>(
      `/admin/v2/${location}/comments`,
      {
        params: {
          id: lessonId,
          type: "lesson",
          page,
        },
      }
    );

    if (!response.data.success) {
      return response.data;
    }

    if (!response.data.data?.body) {
      console.error("Private lesson comments API returned no body:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching private lesson comments:", error);
    const apiError = error as { 
      response?: { 
        data?: { 
          message?: string;
          success?: boolean;
        }; 
      }; 
    };

    const errorMessage = apiError.response?.data?.message || "Failed to fetch private lesson comments";

    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
      message: errorMessage,
    };
  }
}

/**
 * Creates a private lesson comment and returns the updated comments list from server.
 *
 * Endpoint: POST /admin/v2/{location}/comments?instanceId={lessonId}&instanceType=3
 * Body: { content: string }
 */
export async function createPrivateLessonComment(
  location: string,
  lessonId: string,
  data: CreatePrivateLessonCommentRequest
): Promise<PrivateLessonCommentsApiResponse | null> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data?: {
        status?: boolean;
        data?: {
          body?: PrivateLessonCommentResponseBody[];
          pagination?: PaginationInfo;
        };
      };
    }>(
      `/admin/v2/${location}/comments`,
      data,
      {
        params: {
          instanceId: lessonId,
          instanceType: 3,
        },
      }
    );

    const nestedStatus = response.data?.data?.status as unknown;
    const statusOk =
      nestedStatus === undefined ||
      nestedStatus === true ||
      nestedStatus === 1 ||
      nestedStatus === "true";
    const success = response.data?.success === true && statusOk;
    const body = response.data?.data?.data?.body ?? [];
    const pagination = response.data?.data?.data?.pagination;

    return {
      success,
      data: {
        body,
        pagination,
      },
      message: response.data?.message,
    };
  } catch (error: unknown) {
    console.error("Error creating private lesson comment:", error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
      message: apiError.response?.data?.message || "Failed to create private lesson comment",
    };
  }
}

/**
 * Generates invoice for a private lesson.
 *
 * Endpoint: POST /admin/v2/{location}/lesson/generate-invoice
 * Body: { lessonIds: [lessonId] }
 */
export async function generatePrivateLessonInvoice(
  location: string,
  lessonId: string
): Promise<GeneratePrivateLessonInvoiceResponse | null> {
  try {
    const lessonIdNum = Number(lessonId);
    if (Number.isNaN(lessonIdNum)) {
      throw new Error("Invalid lesson id");
    }

    const response = await apiClient.post<GeneratePrivateLessonInvoiceResponse>(
      `/admin/v2/${location}/lesson/generate-invoice`,
      {
        lessonIds: [lessonIdNum],
      }
    );

    const body = response.data;
    const nestedStatus = body?.data?.status;
    const success =
      body?.success === true && isSuccessfulInvoiceStatus(nestedStatus);

    return {
      success,
      data: body?.data,
      message: body?.message,
    };
  } catch (error: unknown) {
    console.error("Error generating private lesson invoice:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to generate invoice",
    };
  }
}

// Update Tax API Types
export interface UpdateTaxRequest {
  id: number;
  tax: number;
}

export interface UpdateTaxResponse {
  success: boolean;
  data: {
    body: {
      tax: number;
    };
  };
  message?: string;
}

/**
 * Updates tax via PUT /admin/v2/{location}/private-lesson/edit-tax
 * Request: { id: number, tax: number }
 * Response: { data: { body: { tax: number } } }
 */
export async function updateTax(
  location: string,
  _privateLessonId: string,
  data: UpdateTaxRequest
): Promise<UpdateTaxResponse | null> {
  try {
    const response = await apiClient.put<UpdateTaxResponse>(
      `/admin/v2/${location}/private-lesson/edit-tax`,
      { id: data.id, tax: data.tax }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating tax:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: { body: { tax: 0 } },
      message: apiError.response?.data?.message || "Failed to update tax",
    };
  }
}

// Edit Schedule API Types
export interface EditScheduleRequest {
  /** Format: "YYYY-MM-DD hh:mm a" — e.g. "2025-02-27 07:00 AM" */
  date: string;
  /** Format: "HH:MM:SS" — e.g. "01:00:00" */
  duration: string;
}

export interface EditScheduleResponseData {
  lessonId: number;
  isPrivateLesson: boolean;
  isOwing: boolean;
  isOwingRentalAgreement: boolean;
  isOnline: boolean;
  resourceId: number;
  title: string;
  start: string;
  end: string;
  url: string;
  className: string;
  backgroundColor: string;
  tooltip: unknown[];
}

export interface EditScheduleResponse {
  success: boolean;
  data: EditScheduleResponseData;
  message?: string;
}

// Explode status/action API types
export interface PrivateLessonExplodeStatusChecks {
  isPrivate?: boolean;
  isUnscheduled?: boolean;
  notExploded?: boolean;
  notExpired?: boolean;
  notInvoiced?: boolean;
}

export interface PrivateLessonExplodeStatusItem {
  canExplode?: boolean;
  lessonId?: number;
  checks?: PrivateLessonExplodeStatusChecks;
}

export interface PrivateLessonExplodeStatusResponse {
  success: boolean;
  data: {
    status: PrivateLessonExplodeStatusItem[];
  };
  message?: string;
}

export interface ExplodePrivateLessonResponse {
  success: boolean;
  data?: {
    originalLessonId?: number;
    explodedLessons?: Array<{
      id: number;
    }>;
    redirectUrl?: string;
    studentId?: number;
  };
  message?: string;
}

/**
 * Fetches explode eligibility/status for a lesson.
 * GET /admin/v2/{location}/lesson/explode/status?lessonIds={lessonId}
 */
export async function getPrivateLessonExplodeStatus(
  location: string,
  lessonId: string
): Promise<PrivateLessonExplodeStatusResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonExplodeStatusResponse>(
      `/admin/v2/${location}/lesson/explode/status`,
      {
        params: {
          lessonIds: Number(lessonId),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching explode status:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        status: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch explode status",
    };
  }
}

/**
 * Explodes a private lesson.
 * POST /admin/v2/{location}/lesson/explode/{lessonId}
 */
export async function explodePrivateLesson(
  location: string,
  lessonId: string
): Promise<ExplodePrivateLessonResponse | null> {
  try {
    const lessonIdNum = Number(lessonId);
    if (Number.isNaN(lessonIdNum)) {
      throw new Error("Invalid lesson id");
    }

    const response = await apiClient.post<ExplodePrivateLessonResponse>(
      `/admin/v2/${location}/lesson/explode/${lessonIdNum}`
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error exploding private lesson:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to explode private lesson",
    };
  }
}

/**
 * Updates the schedule of a private lesson.
 * PUT /admin/v2/{location}/lesson/edit-schedule/{lessonId}
 *
 * Throws on HTTP error so callers only run the success path after a real 200 response.
 */
export async function editLessonSchedule(
  location: string,
  lessonId: number,
  data: EditScheduleRequest
): Promise<EditScheduleResponse> {
  const response = await apiClient.put<EditScheduleResponse>(
    `/admin/v2/${location}/lesson/edit-schedule/${lessonId}`,
    data
  );

  const body = response.data;
  if (!body?.success) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to update schedule"
    );
  }

  return body;
}

// Delete Private Lesson API Types
export interface DeletePrivateLessonResponse {
  success: boolean;
  message?: string;
}

/**
 * Deletes a private lesson via the new bulk-delete endpoint used by listing and
 * detail pages.  We wrap the existing `deleteLessonsApi` so callers don't need
 * to know the payload format.
 */
import { deleteLessonsApi } from "../actionApi/deleteLessons.api";

export async function deletePrivateLesson(
  location: string,
  privateLessonId: string
): Promise<DeletePrivateLessonResponse | null> {
  try {
    const lessonIdNum = Number(privateLessonId);
    if (Number.isNaN(lessonIdNum)) {
      throw new Error("Invalid lesson id");
    }

    const result = await deleteLessonsApi(location, {
      lessonIds: [lessonIdNum],
    });

    // deleteLessonsApi already throws on failure, so success path is simple
    return {
      success: true,
      message: result.message,
    };
  } catch (error: unknown) {
    console.error("Error deleting private lesson:", error);
    const apiError = error as { message?: string };
    return {
      success: false,
      message: apiError.message || (error instanceof Error ? error.message : "Failed to delete private lesson"),
    };
  }
}
