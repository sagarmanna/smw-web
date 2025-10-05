import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";

// Types
export interface StudentBirthday {
  studentId: string;
  studentName: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
}

export interface StudentBirthdayFilters {
  page?: number;
  startDate?: Date;
  endDate?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface StudentBirthdayAPIResponse {
  success: boolean;
  data: {
    body: StudentBirthday[];
    meta: {
      startDate: string;
      endDate: string;
      location: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/**
 * Fetch student birthday list with optional filters
 */
export async function getStudentBirthdayList(
  location: string,
  filters?: StudentBirthdayFilters
): Promise<StudentBirthdayAPIResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.startDate) params.append('startDate', format(filters.startDate, "yyyy-MM-dd"));
      if (filters.endDate) params.append('endDate', format(filters.endDate, "yyyy-MM-dd"));
      // TODO: Uncomment this when the API is updated
      // if (filters.sort) params.append('sort', filters.sort);
      // if (filters.order) params.append('order', filters.order);
    }

    const queryString = params.toString();
    const url = `/admin/v2/${location}/report/student-birthday${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);

    // Assuming response.data is already in the correct format as StudentBirthdayAPIResponse["data"]
    return {
      success: true,
      data: response.data.data, // Adjust if the API nests data differently
      message: response.data.message || 'Birthdays report retrieved successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: { message?: string };
        status?: number;
        statusText?: string;
      };
    };
    
    return {
      success: false,
      data: {
        body: [],
        meta: { startDate: '', endDate: '', location: '' },
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
      },
      message: apiError.response?.data?.message || 'Failed to fetch student birthdays'
    };
  }
}
