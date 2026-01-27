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
    programName: string;
    classroomName: string;
    status: string;
    colorCode: string;
    isOnline: string; // "Yes" | "No"
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
  };
  schedule?: {
    teacher: string;
    teacherId?: number;
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
  };
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

/**
 * Fetches private lesson payments from the API
 * For now, returns mock data
 * 
 * @param location - The location identifier
 * @param privateLessonId - The private lesson ID
 * @returns Promise resolving to the payments response or null on error
 */
export async function getPrivateLessonPayments(
  location: string,
  privateLessonId: string
): Promise<PrivateLessonPaymentsApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.get<PrivateLessonPaymentsApiResponse>(
    //   `/admin/v2/${location}/private-lessons/${privateLessonId}/payments`
    // );
    // return response.data;
    
    void location;
    void privateLessonId;
    
    // Mock data - sample payments
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockPayments: PrivateLessonPaymentResponseBody[] = [
      {
        id: 1,
        date: "Mar 17, 2025",
        paymentMethod: "Amex",
        number: "****1234",
        amount: "$1.69",
      },
      {
        id: 2,
        date: "Mar 10, 2025",
        paymentMethod: "Visa",
        number: "****5678",
        amount: "$5.00",
      },
      {
        id: 3,
        date: "Mar 3, 2025",
        paymentMethod: "Cash",
        number: "",
        amount: "$10.00",
      },
      {
        id: 4,
        date: "Feb 24, 2025",
        paymentMethod: "Mastercard",
        number: "****9012",
        amount: "$15.00",
      },
    ];
    
    return {
      success: true,
      data: {
        body: mockPayments,
      },
    };
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

/**
 * Transforms API response to match the PrivateLessonInfo interface
 */
export function transformApiResponse(
  apiResponse: PrivateLessonDetailsApiResponse,
  paymentsResponse: PrivateLessonPaymentsApiResponse | null,
  historyResponse: PrivateLessonHistoryApiResponse | null,
  commentsResponse: PrivateLessonCommentsApiResponse | null
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
  
  return {
    details: {
      id: (lessonData?.id ?? body.id) || 0,
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
      },
    },
    payments: payments,
    history: history, // History is fetched separately with pagination
    comments: comments,
  };
}

// Update Private Lesson Details API Types
export interface UpdatePrivateLessonDetailsRequest {
  program?: string;
  classroom?: string;
  status?: string;
  colorCode?: string;
  online?: boolean;
}

export interface UpdatePrivateLessonDetailsResponse {
  success: boolean;
  data: {
    id: number;
    program: string;
    classroom: string;
    status: string;
    colorCode: string;
    online: boolean;
  };
  message?: string;
}

/**
 * Updates private lesson details via PUT API
 * For now, returns mock response
 */
export async function updatePrivateLessonDetails(
  location: string,
  privateLessonId: string,
  data: UpdatePrivateLessonDetailsRequest
): Promise<UpdatePrivateLessonDetailsResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        program: data.program || "",
        classroom: data.classroom || "",
        status: data.status || "",
        colorCode: data.colorCode || "",
        online: data.online !== undefined ? data.online : false,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating private lesson details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        program: "",
        classroom: "",
        status: "",
        colorCode: "",
        online: false,
      },
      message: apiError.response?.data?.message || "Failed to update private lesson details",
    };
  }
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
 * Updates attendance via PUT API
 * For now, returns mock response
 */
export async function updateAttendance(
  location: string,
  privateLessonId: string,
  data: UpdateAttendanceRequest
): Promise<UpdateAttendanceResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        present: data.present,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating attendance:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        present: false,
      },
      message: apiError.response?.data?.message || "Failed to update attendance",
    };
  }
}

// Update Cost API Types
export interface UpdateCostRequest {
  costPerHour?: string;
  cost?: string;
  price?: string;
}

export interface UpdateCostResponse {
  success: boolean;
  data: {
    id: number;
    costPerHour: string;
    cost: string;
    price: string;
    profit: string;
  };
  message?: string;
}

/**
 * Updates cost via PUT API
 * For now, returns mock response
 */
export async function updateCost(
  location: string,
  privateLessonId: string,
  data: UpdateCostRequest
): Promise<UpdateCostResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const costPerHour = data.costPerHour || "$10.00";
    const cost = data.cost || "$5.00";
    const price = data.price || "$10.00";
    // Calculate profit
    const costNum = parseFloat(cost.replace("$", ""));
    const priceNum = parseFloat(price.replace("$", ""));
    const profit = `$${(priceNum - costNum).toFixed(2)}`;
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        costPerHour,
        cost,
        price,
        profit,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating cost:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        costPerHour: "",
        cost: "",
        price: "",
        profit: "",
      },
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
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        dueDate: data.dueDate,
      },
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
  lessonRatePerHour: string;
}

export interface UpdatePriceResponse {
  success: boolean;
  data: {
    id: number;
    lessonRatePerHour: string;
  };
  message?: string;
}

/**
 * Updates lesson rate per hour via PUT API
 * For now, returns mock response
 */
export async function updatePrice(
  location: string,
  privateLessonId: string,
  data: UpdatePriceRequest
): Promise<UpdatePriceResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(privateLessonId) || 0,
        lessonRatePerHour: data.lessonRatePerHour,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating price:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(privateLessonId) || 0,
        lessonRatePerHour: "",
      },
      message: apiError.response?.data?.message || "Failed to update price",
    };
  }
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

/**
 * Fetches private lesson comments from the API
 * For now, returns mock data
 * 
 * @param location - The location identifier
 * @param customerId - The customer ID (from lesson details response)
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to the comments response or null on error
 */
export async function getPrivateLessonComments(
  location: string,
  customerId: number,
  page: number = 1
): Promise<PrivateLessonCommentsApiResponse | null> {
  try {
    const response = await apiClient.get<PrivateLessonCommentsApiResponse>(
      `/admin/v2/${location}/customers/${customerId}/comments`,
      {
        params: {
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

// Delete Private Lesson API Types
export interface DeletePrivateLessonResponse {
  success: boolean;
  message?: string;
}

/**
 * Deletes a private lesson via DELETE API
 * For now, returns mock response
 * 
 * @param location - The location identifier
 * @param privateLessonId - The private lesson ID
 * @returns Promise resolving to the delete response or null on error
 */
export async function deletePrivateLesson(
  location: string,
  privateLessonId: string
): Promise<DeletePrivateLessonResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.delete<DeletePrivateLessonResponse>(
    //   `/admin/v2/${location}/private-lessons/${privateLessonId}`
    // );
    // return response.data;
    
    void location;
    void privateLessonId;
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: "Private lesson deleted successfully",
    };
  } catch (error: unknown) {
    console.error("Error deleting private lesson:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete private lesson",
    };
  }
}

