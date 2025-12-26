import { apiClient } from "@/lib/api/client";
import type { EnrolmentInfo } from "../types";

// API Response Types
export interface EnrolmentRate {
  fromDate: string;
  toDate: string;
  amount: string;
}

export interface EnrolmentDiscountsResponse {
  pfDiscount: string;
  multipleEnrolDiscount: string;
}

export interface EnrolmentDetailsResponseBody {
  id: number;
  studentId?: number;
  customerId?: number;
  program: string;
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

/**
 * Transforms API response to match the EnrolmentInfo interface
 * Maps API response fields directly to UI state (no calculations, only type conversions)
 */
export function transformApiResponse(
  apiResponse: EnrolmentDetailsApiResponse,
  scheduleResponse: EnrolmentScheduleApiResponse | null,
  scheduleHistoryResponse: EnrolmentScheduleHistoryApiResponse | null
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
  
  return {
    details: {
      id: body.id,
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
    },
    discounts: {
      pfDiscount: body.discounts?.pfDiscount || "",
      multipleEnrolDiscount: body.discounts?.multipleEnrolDiscount || "",
    },
    paymentFrequency: {
      paymentFrequency: "", // Not in API response yet
    },
    schedule: {
      day: scheduleBody?.day || "",
      time: scheduleBody?.time || "",
      startDate: scheduleBody?.startDate || "",
      endDate: scheduleBody?.endDate || "",
    },
    scheduleHistory: scheduleHistory,
    lessons: [], // Not in API response yet
    history: [], // Not in API response yet
  };
}

// Update Enrolment Details API Types
export interface UpdateEnrolmentDetailsRequest {
  rate?: string;
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
 * Updates enrolment details via PUT API
 * For now, returns mock response
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.put<UpdateEnrolmentDetailsResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/details`,
    //   data
    // );
    // return response.data;
    
    // For now, return mock response - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(enrolmentId) || 0,
        rate: data.rate || "",
        autoRenewal: data.autoRenewal || "",
        online: data.online !== undefined ? data.online : false,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating enrolment details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
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

/**
 * Adjusts enrolment end date via PUT API
 * For now, returns mock response
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.put<AdjustEndDateResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/schedule/end-date`,
    //   data
    // );
    // return response.data;
    
    // For now, return mock response - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(enrolmentId) || 0,
        endDate: data.endDate,
      },
    };
  } catch (error: unknown) {
    console.error("Error adjusting enrolment end date:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
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

/**
 * Updates enrolment discounts via PUT API
 * For now, returns mock response
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.put<UpdateEnrolmentDiscountsResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/discounts`,
    //   data
    // );
    // return response.data;
    
    // For now, return mock response - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(enrolmentId) || 0,
        pfDiscount: data.pfDiscount || "",
        multipleEnrolDiscount: data.multipleEnrolDiscount || "",
      },
    };
  } catch (error: unknown) {
    console.error("Error updating enrolment discounts:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
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
  effectiveDate: string;
}

export interface UpdateEnrolmentPaymentFrequencyResponse {
  success: boolean;
  data: {
    id: number;
    paymentFrequency: string;
    effectiveDate: string;
  };
  message?: string;
}

/**
 * Updates enrolment payment frequency via PUT API
 * For now, returns mock response
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.put<UpdateEnrolmentPaymentFrequencyResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/payment-frequency`,
    //   data
    // );
    // return response.data;
    
    // For now, return mock response - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id: Number(enrolmentId) || 0,
        paymentFrequency: data.paymentFrequency,
        effectiveDate: data.effectiveDate,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating enrolment payment frequency:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
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

