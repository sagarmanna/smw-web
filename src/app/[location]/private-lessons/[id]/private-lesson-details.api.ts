import { apiClient } from "@/lib/api/client";
import type { PrivateLessonInfo } from "../types";

// API Response Types
export interface PrivateLessonDetailsResponseBody {
  id: number;
  program: string;
  classroom: string;
  status: string;
  colorCode: string;
  online: string; // "Yes" | "No"
  student: string;
  studentId?: number;
  customer: string;
  customerId?: number;
  phone: string;
  attendance: {
    present: string; // "Yes" | "No"
  };
  cost: {
    costPerHour: string;
    cost: string;
    price: string;
    profit: string;
  };
  schedule: {
    teacher: string;
    teacherId?: number;
    scheduledDate: string;
    time: string;
    duration: string;
    expiryDate: string;
  };
  dueDate: string;
  totals: {
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.get<PrivateLessonDetailsApiResponse>(
    //   `/admin/v2/${location}/private-lessons/${privateLessonId}/info`
    // );
    // return response.data;
    
    void location;
    void privateLessonId;
    
    // Mock data based on the image
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        body: {
          id: Number(privateLessonId) || 4927684,
          program: "40th Anniversary Piano",
          classroom: "None",
          status: "Scheduled",
          colorCode: "#3B82F6", // Blue color
          online: "No",
          student: "alicia ad",
          studentId: 1,
          customer: "John Fedrick",
          customerId: 1,
          phone: "(415) 789-6325",
          attendance: {
            present: "Yes",
          },
          cost: {
            costPerHour: "$10.00",
            cost: "$5.00",
            price: "$10.00",
            profit: "$5.00",
          },
          schedule: {
            teacher: "Thomas karenshia",
            teacherId: 1,
            scheduledDate: "Monday, December 29th, 2025",
            time: "10:00 AM",
            duration: "00:30",
            expiryDate: "Mar 29, 2026",
          },
          dueDate: "Nov 15, 2025",
          totals: {
            lessonRatePerHour: "$20.00",
            qty: "0.5",
            lessonPrice: "$10.00",
            discount: "$0.00",
            subTotal: "$10.00",
            tax: "$0.00",
            total: "$10.00",
            paid: "$0.00",
            balance: "$10.00",
          },
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching private lesson details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          id: Number(privateLessonId) || 0,
          program: "",
          classroom: "",
          status: "",
          colorCode: "",
          online: "No",
          student: "",
          customer: "",
          phone: "",
          attendance: {
            present: "No",
          },
          cost: {
            costPerHour: "",
            cost: "",
            price: "",
            profit: "",
          },
          schedule: {
            teacher: "",
            scheduledDate: "",
            time: "",
            duration: "",
            expiryDate: "",
          },
          dueDate: "",
          totals: {
            lessonRatePerHour: "",
            qty: "",
            lessonPrice: "",
            discount: "",
            subTotal: "",
            tax: "",
            total: "",
            paid: "",
            balance: "",
          },
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
    
    // Mock data - empty payments for now
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: [],
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
 * Fetches private lesson history from the API with pagination
 * For now, returns mock data
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
    // TODO: Replace with actual API call when backend is ready
    // const response = await apiClient.get<PrivateLessonHistoryApiResponse>(
    //   `/admin/v2/${location}/history`,
    //   {
    //     params: {
    //       type: 'private-lesson',
    //       id: privateLessonId,
    //       page,
    //     },
    //   }
    // );
    // return response.data;
    
    void location;
    void privateLessonId;
    void page;
    
    // Mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching private lesson history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch private lesson history",
    };
  }
}

/**
 * Transforms API response to match the PrivateLessonInfo interface
 */
export function transformApiResponse(
  apiResponse: PrivateLessonDetailsApiResponse,
  paymentsResponse: PrivateLessonPaymentsApiResponse | null,
  historyResponse: PrivateLessonHistoryApiResponse | null
): PrivateLessonInfo {
  const { body } = apiResponse.data;
  
  // Convert online string "Yes"/"No" to boolean
  const onlineBoolean = body.online === "Yes";
  
  // Convert attendance present string "Yes"/"No" to boolean
  const attendancePresent = body.attendance.present === "Yes";
  
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
  
  return {
    details: {
      id: body.id,
      program: body.program || "",
      classroom: body.classroom || "",
      status: body.status || "",
      colorCode: body.colorCode || "",
      online: onlineBoolean,
      student: body.student || "",
      studentId: body.studentId,
      customer: body.customer || "",
      customerId: body.customerId,
      phone: body.phone || "",
      attendance: {
        present: attendancePresent,
      },
      cost: {
        costPerHour: body.cost.costPerHour || "",
        cost: body.cost.cost || "",
        price: body.cost.price || "",
        profit: body.cost.profit || "",
      },
      schedule: {
        teacher: body.schedule.teacher || "",
        teacherId: body.schedule.teacherId,
        scheduledDate: body.schedule.scheduledDate || "",
        time: body.schedule.time || "",
        duration: body.schedule.duration || "",
        expiryDate: body.schedule.expiryDate || "",
      },
      dueDate: body.dueDate || "",
      totals: {
        lessonRatePerHour: body.totals.lessonRatePerHour || "",
        qty: body.totals.qty || "",
        lessonPrice: body.totals.lessonPrice || "",
        discount: body.totals.discount || "",
        subTotal: body.totals.subTotal || "",
        tax: body.totals.tax || "",
        total: body.totals.total || "",
        paid: body.totals.paid || "",
        balance: body.totals.balance || "",
      },
    },
    payments: payments,
    history: history, // History is fetched separately with pagination
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

