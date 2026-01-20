import { apiClient } from "@/lib/api/client";
import type { EnrolmentInfo } from "../types";

// API Response Types
export interface EnrolmentRate {
  fromDate: string;
  toDate: string;
  amount: string;
}

export interface EnrolmentDiscountsResponse {
  pfDiscount?: string; // For private enrolments
  multipleEnrolDiscount?: string; // For private enrolments
  discount?: string; // For group enrolments (single discount field)
  discountType?: number; // For group enrolments: 0 = percentage, 1 = dollar
}

export interface EnrolmentDetailsResponseBody {
  id: number;
  programId?: number;
  studentId?: number;
  customerId?: number;
  program: string;
  programType?: string; // "Private" | "Group" - from API
  teacher: string;
  rates: EnrolmentRate[];
  discounts: EnrolmentDiscountsResponse;
  autoRenewal: string;
  duration: string;
  student: string;
  customer: string;
  online: string;
}

export interface EnrolmentDetailsApiResponse {
  success: boolean;
  data: {
    body: EnrolmentDetailsResponseBody;
  };
  message?: string;
}

// Schedule API Response Types
export interface EnrolmentScheduleResponseBody {
  id: number;
  day: string;
  time: string;
  startDate: string;
  endDate: string;
}

export interface EnrolmentScheduleApiResponse {
  success: boolean;
  data: {
    body: EnrolmentScheduleResponseBody;
  };
  message?: string;
}

// Schedule History API Response Types
export interface EnrolmentScheduleHistoryResponseBody {
  id: number;
  date: string;
  day: string;
  time: string;
  duration: string;
  teacher: string;
}

export interface EnrolmentScheduleHistoryApiResponse {
  success: boolean;
  data: {
    body: EnrolmentScheduleHistoryResponseBody[];
  };
  message?: string;
}

/**
 * Fetches detailed enrolment information from the API
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/info
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the enrolment details response or null on error
 */
export async function getEnrolmentDetails(
  location: string,
  enrolmentId: string
): Promise<EnrolmentDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentDetailsApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/info`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          id: Number(enrolmentId) || 0,
          program: "",
          programType: "Private",
          teacher: "",
          rates: [],
          discounts: {
            pfDiscount: "",
            multipleEnrolDiscount: "",
          },
          autoRenewal: "",
          duration: "",
          student: "",
          customer: "",
          online: "",
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment details",
    };
  }
}

/**
 * Fetches enrolment schedule information from the API
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/schedule
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the enrolment schedule response or null on error
 */
export async function getEnrolmentSchedule(
  location: string,
  enrolmentId: string
): Promise<EnrolmentScheduleApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentScheduleApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/schedule`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment schedule:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          id: Number(enrolmentId) || 0,
          day: "",
          time: "",
          startDate: "",
          endDate: "",
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment schedule",
    };
  }
}

/**
 * Fetches enrolment schedule history information from the API
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/schedule-history
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the enrolment schedule history response or null on error
 */
export async function getEnrolmentScheduleHistory(
  location: string,
  enrolmentId: string
): Promise<EnrolmentScheduleHistoryApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentScheduleHistoryApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/schedule-history`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment schedule history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment schedule history",
    };
  }
}

// Payment Frequency API Response Types
export interface EnrolmentPaymentFrequencyResponseBody {
  id: number;
  paymentFrequency: string;
  effectiveDate?: string; // Format: "MMM dd, yyyy" (e.g., "Mar 01, 2025")
}

export interface EnrolmentPaymentFrequencyApiResponse {
  success: boolean;
  data: {
    body: EnrolmentPaymentFrequencyResponseBody;
  };
  message?: string;
}

// Lessons API Response Types
export interface EnrolmentLessonResponseBody {
  id: number;
  dueDate: string;
  date: string;
  duration: string;
  status: string;
  price: string;
  owing: string;
  online: string;
}

export interface EnrolmentLessonsApiResponse {
  success: boolean;
  data: {
    body: EnrolmentLessonResponseBody[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

// History API Response Types
export interface EnrolmentHistoryResponseBody {
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

export interface EnrolmentHistoryApiResponse {
  success: boolean;
  data: {
    body: EnrolmentHistoryResponseBody[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

/**
 * Fetches enrolment payment frequency from the API
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/payment-frequency
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the payment frequency response or null on error
 */
export async function getEnrolmentPaymentFrequency(
  location: string,
  enrolmentId: string
): Promise<EnrolmentPaymentFrequencyApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentPaymentFrequencyApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/payment-frequency`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment payment frequency:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          id: Number(enrolmentId) || 0,
          paymentFrequency: "",
          effectiveDate: undefined,
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment payment frequency",
    };
  }
}

/**
 * Fetches enrolment lessons from the API
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/lessons
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the lessons response or null on error
 */
export async function getEnrolmentLessons(
  location: string,
  enrolmentId: string
): Promise<EnrolmentLessonsApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentLessonsApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/lessons`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment lessons",
    };
  }
}

/**
 * Fetches enrolment lessons from the API with pagination (for group enrolments only)
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/lessons?page={page}&limit={limit}
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param page - The page number for pagination (default: 1)
 * @param limit - The number of items per page (default: 10)
 * @returns Promise resolving to the lessons response or null on error
 */
export async function getEnrolmentLessonsWithPagination(
  location: string,
  enrolmentId: string,
  page: number = 1,
  limit: number = 10
): Promise<EnrolmentLessonsApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentLessonsApiResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/lessons`,
      {
        params: {
          page,
          limit: limit === -1 ? 99999 : limit,
        },
      }
    );
    
    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment lessons",
    };
  }
}

/**
 * Fetches enrolment history from the API with pagination
 * Endpoint: GET /admin/v2/{location}/history?type=enrolment&id={enrolmentId}&page={page}
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to the history response or null on error
 */
export async function getEnrolmentHistory(
  location: string,
  enrolmentId: string,
  page: number = 1
): Promise<EnrolmentHistoryApiResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentHistoryApiResponse>(
      `/admin/v2/${location}/history`,
      {
        params: {
          type: 'enrolment',
          id: enrolmentId,
          page,
        },
      }
    );
    
    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching enrolment history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch enrolment history"
    );
    return null;
  }
}

/**
 * Transforms API response to match the EnrolmentInfo interface
 * Maps API response fields directly to UI state (no calculations, only type conversions)
 * 
 * @param apiResponse - The enrolment details API response
 * @param scheduleResponse - The schedule API response (nullable)
 * @param scheduleHistoryResponse - The schedule history API response (nullable)
 * @param paymentFrequencyResponse - The payment frequency API response (nullable)
 * @param lessonsResponse - The lessons API response (nullable)
 * @returns Transformed EnrolmentInfo object ready for UI consumption
 */
export function transformApiResponse(
  apiResponse: EnrolmentDetailsApiResponse,
  scheduleResponse: EnrolmentScheduleApiResponse | null,
  scheduleHistoryResponse: EnrolmentScheduleHistoryApiResponse | null,
  paymentFrequencyResponse: EnrolmentPaymentFrequencyApiResponse | null,
  lessonsResponse: EnrolmentLessonsApiResponse | null
): EnrolmentInfo {
  const { body } = apiResponse.data;
  
  // Store all rates from API response directly (no formatting, use API data as-is)
  const rates = body.rates || [];
  const firstRate = rates.length > 0 ? rates[0] : null;
  
  // Convert online string "Yes"/"No" to boolean (minimal type conversion, no calculation)
  const onlineBoolean = body.online === "Yes";
  
  // Get schedule data from API response
  const scheduleBody = scheduleResponse?.data?.body;
  
  // Get schedule history data from API response
  const scheduleHistoryBody = scheduleHistoryResponse?.data?.body || [];
  const scheduleHistory = scheduleHistoryBody.map((item) => ({
    id: item.id,
    date: item.date || "",
    day: item.day || "",
    time: item.time || "",
    duration: item.duration || "",
    teacher: item.teacher || "",
  }));
  
  // Get payment frequency from API response
  const paymentFrequencyBody = paymentFrequencyResponse?.data?.body;
  
  // Get lessons from API response
  const lessonsBody = lessonsResponse?.data?.body || [];
  const lessons = lessonsBody.map((item) => ({
    id: item.id,
    dueDate: item.dueDate || "",
    date: item.date || "",
    duration: item.duration || "",
    status: item.status || "",
    price: item.price || "",
    owing: item.owing || "",
    online: item.online === "Yes",
  }));
  
  // Normalize programType from API ("Private"/"Group") to lowercase type ("private"/"group")
  // Validate and normalize the type to ensure type safety
  const normalizedType: "private" | "group" | undefined = (() => {
    if (!body.programType) return undefined;
    const lowercased = body.programType.toLowerCase();
    if (lowercased === "private" || lowercased === "group") {
      return lowercased as "private" | "group";
    }
    // Log unexpected values for debugging but don't throw
    console.warn(`Unexpected programType value: "${body.programType}". Defaulting to undefined.`);
    return undefined;
  })();

  return {
    details: {
      id: body.id,
      programId: body.programId,
      program: body.program || "",
      teacher: body.teacher || "",
      rate: firstRate?.amount || "",
      rateFromDate: firstRate?.fromDate || undefined,
      rateToDate: firstRate?.toDate || undefined,
      rates: rates.map((rate) => ({
        fromDate: rate.fromDate || "",
        toDate: rate.toDate || "",
        amount: rate.amount || "",
      })),
      autoRenewal: body.autoRenewal || "",
      duration: body.duration || "",
      student: body.student || "",
      studentId: body.studentId,
      customer: body.customer || "",
      customerId: body.customerId,
      online: onlineBoolean,
      type: normalizedType,
    },
    discounts: {
      pfDiscount: body.discounts?.pfDiscount,
      multipleEnrolDiscount: body.discounts?.multipleEnrolDiscount,
      discount: body.discounts?.discount,
    },
    paymentFrequency: {
      paymentFrequency: paymentFrequencyBody?.paymentFrequency || "",
      effectiveDate: paymentFrequencyBody?.effectiveDate,
    },
    schedule: {
      day: scheduleBody?.day || "",
      time: scheduleBody?.time || "",
      startDate: scheduleBody?.startDate || "",
      endDate: scheduleBody?.endDate || "",
    },
    scheduleHistory: scheduleHistory,
    lessons: lessons,
    history: [], // History is fetched separately with pagination
  };
}

// Update Enrolment Details API Types
export interface UpdateEnrolmentDetailsRequest {
  rate?: string;
  rates?: Array<{ amount: string; fromDate: string; toDate: string }>;
  autoRenewal?: string;
  online?: boolean;
}

export interface UpdateEnrolmentDetailsResponse {
  success: boolean;
  data: {
    id: number;
    rate: string;
    autoRenewal: string;
    online: boolean;
  };
  message?: string;
}

/**
 * Updates enrolment details via POST API
 * POST /admin/v2/:location/enrolments/:id/edit-program-rate
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The enrolment data to update
 * @returns Promise resolving to the update response or null on error
 */
export async function updateEnrolmentDetails(
  location: string,
  enrolmentId: string,
  data: UpdateEnrolmentDetailsRequest
): Promise<UpdateEnrolmentDetailsResponse | null> {
  try {
    // Transform frontend data to API format (matches legacy: CourseProgramRate[$key][programRate])
    const requestBody: {
      rate?: number;
      courseProgramRates?: Array<{ programRate: number }>;
      isAutoRenew?: boolean;
      isOnline?: boolean;
    } = {};

    // Handle multiple rates (matches legacy: loops through all courseProgramRates)
    // Priority: rates array > single rate
    if (data.rates && data.rates.length > 0) {
      // Map all rates to API format - preserve all rates (backend will handle validation)
      const mappedRates = data.rates
        .map((rate) => {
          if (!rate.amount || rate.amount.trim() === "") {
            // Skip rates with completely empty amounts
            return null;
          }
          
          // Extract numeric value from formatted string (e.g., "$20.00" -> 20.00)
          // Handle both formatted "$20.00" and plain "20.00" formats
          const rateValue = parseFloat(rate.amount.replace(/[^0-9.]/g, ""));
          
          // Include rate if it's a valid number (including 0)
          if (!isNaN(rateValue) && rateValue >= 0) {
            return { programRate: rateValue };
          }
          
          return null;
        })
        .filter((rate): rate is { programRate: number } => rate !== null);
      
      // Set courseProgramRates if we have at least one valid rate
      if (mappedRates.length > 0) {
        requestBody.courseProgramRates = mappedRates;
      }
    }
    
    // Fallback to single rate only if rates array is not provided or all rates were invalid
    if (!requestBody.courseProgramRates && data.rate) {
      const rateValue = parseFloat(data.rate.replace(/[^0-9.]/g, ""));
      if (!isNaN(rateValue) && rateValue > 0) {
        requestBody.rate = rateValue;
      }
    }

    // Convert autoRenewal string to boolean
    if (data.autoRenewal !== undefined) {
      requestBody.isAutoRenew = data.autoRenewal === "Enabled";
    }

    // Convert online boolean
    if (data.online !== undefined) {
      requestBody.isOnline = data.online;
    }

    const response = await apiClient.post<{
      success: boolean;
      data: {
        message: string;
      };
      message?: string;
    }>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/edit-program-rate`,
      requestBody
    );

    if (response.data.success) {
      return {
        success: true,
        data: {
          id: Number(enrolmentId) || 0,
          rate: data.rate || "",
          autoRenewal: data.autoRenewal || "",
          online: data.online !== undefined ? data.online : false,
        },
        message: response.data.data?.message || response.data.message,
      };
    } else {
      return {
        success: false,
        data: {
          id: Number(enrolmentId) || 0,
          rate: "",
          autoRenewal: "",
          online: false,
        },
        message: response.data.message || "Failed to update enrolment details",
      };
    }
  } catch (error: unknown) {
    console.error("Error updating enrolment details:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        rate: "",
        autoRenewal: "",
        online: false,
      },
      message: apiError.response?.data?.message || "Failed to update enrolment details",
    };
  }
}

// Adjust End Date API Types
export interface AdjustEndDateRequest {
  endDate: string;
}

export interface AdjustEndDateResponse {
  success: boolean;
  data: {
    id: number;
    endDate: string;
  };
  message?: string;
}

// Adjust End Date Preview API Types
export interface PreviewItem {
  objects: string;
  action: string;
  date_range: string;
}

export interface AdjustEndDatePreviewResponse {
  success: boolean;
  data: {
    action: 'shrink' | 'extend' | null;
    dateRange: string | null;
    previewItems: PreviewItem[];
  };
  message?: string;
}

/**
 * Gets preview of what will be affected when adjusting private enrolment end date
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/adjust-end-date-preview?endDate=YYYY-MM-DD
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param endDate - The new end date in YYYY-MM-DD format
 * @returns Promise resolving to the preview response or null on error
 */
export async function getAdjustEndDatePreview(
  location: string,
  enrolmentId: string,
  endDate: string
): Promise<AdjustEndDatePreviewResponse | null> {
  try {
    const url = `/admin/v2/${location}/enrolments/${enrolmentId}/adjust-end-date-preview`;
    console.log("Calling preview API:", url, "with endDate:", endDate);
    const response = await apiClient.get<AdjustEndDatePreviewResponse>(
      url,
      {
        params: {
          endDate,
        },
      }
    );
    console.log("Preview API response:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error getting adjust end date preview:", error);
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
        status?: number;
        statusText?: string;
      };
      message?: string;
      code?: string;
    };
    
    // Log more details about the error
    if (apiError.response) {
      console.error("API Error Response:", {
        status: apiError.response.status,
        statusText: apiError.response.statusText,
        data: apiError.response.data,
      });
    } else {
      console.error("Network Error Details:", {
        message: apiError.message,
        code: apiError.code,
      });
    }
    
    return {
      success: false,
      data: {
        action: null,
        dateRange: null,
        previewItems: [],
      },
      message: apiError.response?.data?.message || apiError.message || "Failed to get preview",
    };
  }
}

/**
 * Gets preview of what will be affected when adjusting group enrolment end date
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/adjust-group-end-date-preview?endDate=YYYY-MM-DD
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param endDate - The new end date in YYYY-MM-DD format
 * @returns Promise resolving to the preview response or null on error
 */
export async function getGroupAdjustEndDatePreview(
  location: string,
  enrolmentId: string,
  endDate: string
): Promise<AdjustEndDatePreviewResponse | null> {
  try {
    const url = `/admin/v2/${location}/enrolments/${enrolmentId}/adjust-group-end-date-preview`;
    console.log("Calling group preview API:", url, "with endDate:", endDate);
    const response = await apiClient.get<AdjustEndDatePreviewResponse>(
      url,
      {
        params: {
          endDate,
        },
      }
    );
    console.log("Group preview API response:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error getting group adjust end date preview:", error);
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
        status?: number;
        statusText?: string;
      };
      message?: string;
      code?: string;
    };
    
    // Log more details about the error
    if (apiError.response) {
      console.error("API Error Response:", {
        status: apiError.response.status,
        statusText: apiError.response.statusText,
        data: apiError.response.data,
      });
    } else {
      console.error("Network Error Details:", {
        message: apiError.message,
        code: apiError.code,
      });
    }
    
    return {
      success: false,
      data: {
        action: null,
        dateRange: null,
        previewItems: [],
      },
      message: apiError.response?.data?.message || apiError.message || "Failed to get preview",
    };
  }
}

/**
 * Adjusts private enrolment end date via POST API
 * Endpoint: POST /admin/v2/{location}/enrolments/{enrolmentId}/adjust-end-date
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The end date data
 * @returns Promise resolving to the update response or null on error
 */
export async function adjustEnrolmentEndDate(
  location: string,
  enrolmentId: string,
  data: AdjustEndDateRequest
): Promise<AdjustEndDateResponse | null> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        message: string;
      };
      message?: string;
    }>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/adjust-end-date`,
      data
    );
    
    if (response.data.success) {
      return {
        success: true,
        data: {
          id: Number(enrolmentId) || 0,
          endDate: data.endDate,
        },
        message: response.data.data?.message || response.data.message,
      };
    } else {
      return {
        success: false,
        data: {
          id: Number(enrolmentId) || 0,
          endDate: "",
        },
        message: response.data.message || "Failed to adjust enrolment end date",
      };
    }
  } catch (error: unknown) {
    console.error("Error adjusting enrolment end date:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        endDate: "",
      },
      message: apiError.response?.data?.message || "Failed to adjust enrolment end date",
    };
  }
}

/**
 * Adjusts group enrolment end date via POST API
 * Endpoint: POST /admin/v2/{location}/enrolments/{enrolmentId}/adjust-group-end-date
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The end date data
 * @returns Promise resolving to the update response or null on error
 */
export async function adjustGroupEnrolmentEndDate(
  location: string,
  enrolmentId: string,
  data: AdjustEndDateRequest
): Promise<AdjustEndDateResponse | null> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        message: string;
      };
      message?: string;
    }>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/adjust-group-end-date`,
      data
    );
    
    if (response.data.success) {
      return {
        success: true,
        data: {
          id: Number(enrolmentId) || 0,
          endDate: data.endDate,
        },
        message: response.data.data?.message || response.data.message,
      };
    } else {
      return {
        success: false,
        data: {
          id: Number(enrolmentId) || 0,
          endDate: "",
        },
        message: response.data.message || "Failed to adjust group enrolment end date",
      };
    }
  } catch (error: unknown) {
    console.error("Error adjusting group enrolment end date:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        endDate: "",
      },
      message: apiError.response?.data?.message || "Failed to adjust group enrolment end date",
    };
  }
}

// Permanent Schedule Change API Types
export interface PermanentScheduleChangeRequest {
  startingDate: string;
}

export interface PermanentScheduleChangeResponse {
  success: boolean;
  data: {
    id: number;
    startingDate: string;
  };
  message?: string;
}

/**
 * Performs permanent schedule change via PUT API
 * For now, returns mock response
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The starting date data
 * @returns Promise resolving to the update response or null on error
 */
export async function permanentScheduleChange(
  location: string,
  enrolmentId: string,
  data: PermanentScheduleChangeRequest
): Promise<PermanentScheduleChangeResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.put<PermanentScheduleChangeResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/schedule/permanent-change`,
    //   data
    // );
    // return response.data;
    
    // For now, return mock response - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(enrolmentId) || 0,
        startingDate: data.startingDate,
      },
    };
  } catch (error: unknown) {
    console.error("Error performing permanent schedule change:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        startingDate: "",
      },
      message: apiError.response?.data?.message || "Failed to perform permanent schedule change",
    };
  }
}

// Update Enrolment Discounts API Types
export interface UpdateEnrolmentDiscountsRequest {
  pfDiscount?: string;
  multipleEnrolDiscount?: string;
}

export interface UpdateEnrolmentDiscountsResponse {
  success: boolean;
  data: {
    id: number;
    pfDiscount: string;
    multipleEnrolDiscount: string;
  };
  message?: string;
}

// Update Group Enrolment Discount API Types
export interface UpdateGroupEnrolmentDiscountRequest {
  discount?: string;
  discountType?: number; // 0 = percentage, 1 = dollar
}

export interface UpdateGroupEnrolmentDiscountResponse {
  success: boolean;
  data: {
    id: number;
    discount: string;
    discountType: number;
  };
  message?: string;
}

/**
 * Updates enrolment discounts via POST API
 * Endpoint: POST /admin/v2/{location}/enrolments/{enrolmentId}/discounts
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The discount data to update
 * @returns Promise resolving to the update response or null on error
 */
export async function updateEnrolmentDiscounts(
  location: string,
  enrolmentId: string,
  data: UpdateEnrolmentDiscountsRequest
): Promise<UpdateEnrolmentDiscountsResponse | null> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        status: boolean;
        message?: string;
      };
      message?: string;
    }>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/discounts`,
      data
    );
    
    if (response.data.success && response.data.data?.status) {
      return {
        success: true,
        data: {
          id: Number(enrolmentId) || 0,
          pfDiscount: data.pfDiscount || "",
          multipleEnrolDiscount: data.multipleEnrolDiscount || "",
        },
        message: response.data.data?.message || response.data.message,
      };
    } else {
      return {
        success: false,
        data: {
          id: Number(enrolmentId) || 0,
          pfDiscount: "",
          multipleEnrolDiscount: "",
        },
        message: response.data.data?.message || response.data.message || "Failed to update enrolment discounts",
      };
    }
  } catch (error: unknown) {
    console.error("Error updating enrolment discounts:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        pfDiscount: "",
        multipleEnrolDiscount: "",
      },
      message: apiError.response?.data?.message || "Failed to update enrolment discounts",
    };
  }
}

/**
 * Updates group enrolment discount via POST API
 * Endpoint: POST /admin/v2/{location}/enrolments/{enrolmentId}/group-discount
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The discount data to update (discount, discountType)
 * @returns Promise resolving to the update response or null on error
 */
export async function updateGroupEnrolmentDiscount(
  location: string,
  enrolmentId: string,
  data: UpdateGroupEnrolmentDiscountRequest
): Promise<UpdateGroupEnrolmentDiscountResponse | null> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        status: boolean;
        message?: string;
      };
      message?: string;
    }>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/group-discount`,
      data
    );
    
    if (response.data.success && response.data.data?.status) {
      return {
        success: true,
        data: {
          id: Number(enrolmentId) || 0,
          discount: data.discount || "",
          discountType: data.discountType ?? 1,
        },
        message: response.data.data?.message || response.data.message,
      };
    } else {
      return {
        success: false,
        data: {
          id: Number(enrolmentId) || 0,
          discount: "",
          discountType: 1,
        },
        message: response.data.data?.message || response.data.message || "Failed to update group enrolment discount",
      };
    }
  } catch (error: unknown) {
    console.error("Error updating group enrolment discount:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        discount: "",
        discountType: 1,
      },
      message: apiError.response?.data?.message || "Failed to update group enrolment discount",
    };
  }
}

// Payment Frequency Options API Types
export interface PaymentFrequencyOption {
  value: string;
  label: string;
}

export interface PaymentFrequencyOptionsResponse {
  success: boolean;
  data: PaymentFrequencyOption[];
  message?: string;
}

/**
 * Fetches available payment frequency options from the API
 * For now, returns mock data
 * 
 * @param location - The location identifier
 * @returns Promise resolving to the payment frequency options response or null on error
 */
export async function getPaymentFrequencyOptions(
  location: string
): Promise<PaymentFrequencyOptionsResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.get<PaymentFrequencyOptionsResponse>(
    //   `/admin/v2/${location}/enrolment/payment-frequency-options`
    // );
    // return response.data;
    
    void location;
    
    // For now, return mock data - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockOptions: PaymentFrequencyOption[] = [
      { value: "Monthly", label: "Monthly" },
      { value: "Bi-Monthly", label: "Bi-Monthly" },
      { value: "Quarterly", label: "Quarterly" },
      { value: "Every 4 Months", label: "Every 4 Months" },
      { value: "Every 5 Months", label: "Every 5 Months" },
      { value: "Semi-Annually", label: "Semi-Annually" },
      { value: "Every 7 Months", label: "Every 7 Months" },
      { value: "Every 8 Months", label: "Every 8 Months" },
      { value: "Every 9 Months", label: "Every 9 Months" },
      { value: "Every 10 Months", label: "Every 10 Months" },
      { value: "Every 11 Months", label: "Every 11 Months" },
      { value: "Annually", label: "Annually" },
    ];
    
    return {
      success: true,
      data: mockOptions,
    };
  } catch (error: unknown) {
    console.error("Error fetching payment frequency options:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || "Failed to fetch payment frequency options",
    };
  }
}

// Update Enrolment Payment Frequency API Types
export interface UpdateEnrolmentPaymentFrequencyRequest {
  paymentFrequency: string;
  effectiveDate: string; // Format: "MMM dd, yyyy" (e.g., "Dec 01, 2025") - will be converted to 1st day of selected month
}

export interface UpdateEnrolmentPaymentFrequencyResponse {
  success: boolean;
  data: {
    id: number;
    paymentFrequency: string;
    effectiveDate: string;
  };
  message?: string;
  errorCode?: string;
}

/**
 * Updates enrolment payment frequency via PUT API
 * Endpoint: PUT /admin/v2/{location}/enrolments/{enrolmentId}/payment-frequency
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @param data - The payment frequency data to update
 * @returns Promise resolving to the update response or null on error
 */
export async function updateEnrolmentPaymentFrequency(
  location: string,
  enrolmentId: string,
  data: UpdateEnrolmentPaymentFrequencyRequest
): Promise<UpdateEnrolmentPaymentFrequencyResponse | null> {
  try {
    const response = await apiClient.put<UpdateEnrolmentPaymentFrequencyResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/payment-frequency`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating enrolment payment frequency:", error);
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      data: {
        id: Number(enrolmentId) || 0,
        paymentFrequency: "",
        effectiveDate: "",
      },
      message: apiError.response?.data?.message || "Failed to update enrolment payment frequency",
    };
  }
}

// Delete Enrolment API Types
export interface DeleteEnrolmentResponse {
  success: boolean;
  data?: {
    status: boolean;
    url?: string;
    message?: string;
  };
  message?: string;
}

/**
 * Deletes an enrolment via DELETE API
 * Endpoint: DELETE /admin/v2/{location}/enrolments/{enrolmentId}
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteEnrolment(
  location: string,
  enrolmentId: string
): Promise<DeleteEnrolmentResponse | null> {
  try {
    const response = await apiClient.delete<DeleteEnrolmentResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}`
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete enrolment",
    };
  }
}

/**
 * Deletes a group enrolment via DELETE API
 * Endpoint: DELETE /admin/v2/{location}/enrolments/{enrolmentId}/group
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteGroupEnrolment(
  location: string,
  enrolmentId: string
): Promise<DeleteEnrolmentResponse | null> {
  try {
    const response = await apiClient.delete<DeleteEnrolmentResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/group`
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete group enrolment",
    };
  }
}

// Delete Preview Types
export interface DeletePreviewItem {
  objects: string;
  action: string;
  date_range: string;
}

export interface DeletePreviewPayment {
  amount: number;
  type: string;
  reference: string | null;
}

export interface EnrolmentDeletePreviewResponse {
  success: boolean;
  data?: {
    previewItems: DeletePreviewItem[];
    payments: DeletePreviewPayment[];
    dateRange: string;
  };
  message?: string;
}

/**
 * Gets the delete preview for an enrolment
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/delete-preview
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the delete preview response
 */
export async function getEnrolmentDeletePreview(
  location: string,
  enrolmentId: string
): Promise<EnrolmentDeletePreviewResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentDeletePreviewResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/delete-preview`
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error getting delete preview:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to get delete preview",
    };
  }
}

/**
 * Full delete enrolment - deletes enrolment with all transactional data
 * Endpoint: POST /admin/v2/{location}/enrolments/{enrolmentId}/full-delete
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteEnrolmentFull(
  location: string,
  enrolmentId: string
): Promise<DeleteEnrolmentResponse | null> {
  try {
    const response = await apiClient.post<DeleteEnrolmentResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/full-delete`
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to fully delete enrolment",
    };
  }
}

// Enrolment Discount Preview API Types
export interface EnrolmentDiscountPreviewResponse {
  success: boolean;
  data?: {
    previewItems: PreviewItem[];
  };
  message?: string;
}

/**
 * Gets preview of what will be affected when editing enrolment discounts
 * Endpoint: GET /admin/v2/{location}/enrolments/{enrolmentId}/discount-preview
 * 
 * @param location - The location identifier (e.g., "training-location")
 * @param enrolmentId - The enrolment ID
 * @returns Promise resolving to the preview response or null on error
 */
export async function getEnrolmentDiscountPreview(
  location: string,
  enrolmentId: string
): Promise<EnrolmentDiscountPreviewResponse | null> {
  try {
    const response = await apiClient.get<EnrolmentDiscountPreviewResponse>(
      `/admin/v2/${location}/enrolments/${enrolmentId}/discount-preview`
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error getting enrolment discount preview:", error);
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
        status?: number;
        statusText?: string;
      };
      message?: string;
      code?: string;
    };
    
    return {
      success: false,
      data: {
        previewItems: [],
      },
      message: apiError.response?.data?.message || apiError.message || "Failed to get preview",
    };
  }
}

