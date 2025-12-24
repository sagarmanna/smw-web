import { apiClient } from "@/lib/api/client";
import type { EnrolmentInfo, EnrolmentDetails, EnrolmentDiscounts, EnrolmentPaymentFrequency, EnrolmentSchedule, EnrolmentScheduleHistory, EnrolmentLesson } from "../types";
import { mockEnrolmentDetails } from "../mockData/enrolmentDetailsMockData";

// API Response Types
export interface EnrolmentDetailsApiResponse {
  success: boolean;
  data: {
    body: EnrolmentDetailsResponseBody;
  };
  message?: string;
}

export interface EnrolmentDetailsResponseBody {
  id: number;
  program: string;
  teacher: string;
  rate: string;
  rateFromDate?: string;
  rateToDate?: string;
  autoRenewal: string;
  duration: string;
  student: string;
  studentId?: number;
  customer: string;
  customerId?: number;
  online: boolean;
  pfDiscount?: string;
  multipleEnrolDiscount?: string;
  paymentFrequency?: string;
  day?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetches detailed enrolment information from the API
 * For now, returns mock data
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.get<EnrolmentDetailsApiResponse>(
    //   `/admin/v2/${location}/enrolment/${enrolmentId}/details`
    // );
    // return response.data;
    
    // For now, return mock data - simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData = { ...mockEnrolmentDetails };
    mockData.details.id = Number(enrolmentId) || mockData.details.id;
    
    return {
      success: true,
      data: {
        body: {
          id: mockData.details.id,
          program: mockData.details.program,
          teacher: mockData.details.teacher,
          rate: mockData.details.rate,
          rateFromDate: mockData.details.rateFromDate,
          rateToDate: mockData.details.rateToDate,
          autoRenewal: mockData.details.autoRenewal,
          duration: mockData.details.duration,
          student: mockData.details.student,
          studentId: mockData.details.studentId,
          customer: mockData.details.customer,
          customerId: mockData.details.customerId,
          online: mockData.details.online,
          pfDiscount: mockData.discounts.pfDiscount,
          multipleEnrolDiscount: mockData.discounts.multipleEnrolDiscount,
          paymentFrequency: mockData.paymentFrequency.paymentFrequency,
          day: mockData.schedule.day,
          time: mockData.schedule.time,
          startDate: mockData.schedule.startDate,
          endDate: mockData.schedule.endDate,
        },
      },
    };
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
          rate: "",
          autoRenewal: "Disabled",
          duration: "",
          student: "",
          customer: "",
          online: false,
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch enrolment details",
    };
  }
}

/**
 * Transforms API response to match the EnrolmentInfo interface
 */
export function transformApiResponse(apiResponse: EnrolmentDetailsApiResponse): EnrolmentInfo {
  const { body } = apiResponse.data;
  const mockData = mockEnrolmentDetails;
  
  return {
    details: {
      id: body.id,
      program: body.program || mockData.details.program,
      teacher: body.teacher || mockData.details.teacher,
      rate: body.rate || mockData.details.rate,
      rateFromDate: body.rateFromDate || mockData.details.rateFromDate,
      rateToDate: body.rateToDate || mockData.details.rateToDate,
      autoRenewal: body.autoRenewal || mockData.details.autoRenewal,
      duration: body.duration || mockData.details.duration,
      student: body.student || mockData.details.student,
      studentId: body.studentId || mockData.details.studentId,
      customer: body.customer || mockData.details.customer,
      customerId: body.customerId || mockData.details.customerId,
      online: body.online !== undefined ? body.online : mockData.details.online,
    },
    discounts: {
      pfDiscount: body.pfDiscount || mockData.discounts.pfDiscount,
      multipleEnrolDiscount: body.multipleEnrolDiscount || mockData.discounts.multipleEnrolDiscount,
    },
    paymentFrequency: {
      paymentFrequency: body.paymentFrequency || mockData.paymentFrequency.paymentFrequency,
    },
    schedule: {
      day: body.day || mockData.schedule.day,
      time: body.time || mockData.schedule.time,
      startDate: body.startDate || mockData.schedule.startDate,
      endDate: body.endDate || mockData.schedule.endDate,
    },
    scheduleHistory: mockData.scheduleHistory,
    lessons: mockData.lessons,
    history: mockData.history,
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
        rate: data.rate || "$20.00",
        autoRenewal: data.autoRenewal || "Disabled",
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
        autoRenewal: "Disabled",
        online: false,
      },
      message: apiError.response?.data?.message || "Failed to update enrolment details",
    };
  }
}

