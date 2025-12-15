import { apiClient } from './client';

// Create Student API
export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  customerId: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'not-specified';
}

export interface CreateStudentResponse {
  success: boolean;
  message: string;
  data: {
    status: boolean;
    url: string;
  };
}

export interface CreateStudentErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Create a new student
 * @param location - Location slug
 * @param userId - Customer/User ID
 * @param data - Student creation data
 * @returns Created student data with URL
 */
export async function createStudent(
  location: string,
  userId: number | string,
  data: CreateStudentRequest
): Promise<CreateStudentResponse> {
  try {
    const response = await apiClient.post<CreateStudentResponse>(
      `/admin/v2/${location}/student/create?userId=${userId}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating student:', error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: CreateStudentErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as CreateStudentErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || 'Failed to create student',
    } as CreateStudentErrorResponse;
  }
}

