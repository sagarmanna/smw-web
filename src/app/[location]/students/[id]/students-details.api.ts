import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Shared response types for student details
// ---------------------------------------------

export interface StudentResponse {
  id: number;
  fullName: string;
  birthDate: string;
  age: string;
  gender: string;
  status: string;
  note: string;
}

export interface StudentCustomerResponse {
  id: number;
  name: string;
  phone: string;
}

export interface StudentDetailsResponseBody {
  student: StudentResponse;
  customer: StudentCustomerResponse;
}

export interface StudentDetailsApiResponse {
  success: boolean;
  data: {
    body: StudentDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Enrolments API Response Types
// ---------------------------------------------

export interface StudentEnrolmentResponse {
  id: number;
  programName: string;
  teacherName: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface StudentEnrolmentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentEnrolmentsApiResponse {
  success: boolean;
  data: {
    body: StudentEnrolmentResponse[];
    pagination: StudentEnrolmentsPagination;
  };
  message?: string;
}

/**
 * Fetches student enrolments from the API
 * Endpoint: GET /admin/v2/{location}/student/{studentId}/enrolments
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @returns Promise resolving to the enrolments response or null on error
 */
export async function getStudentEnrolments(
  location: string,
  studentId: string
): Promise<StudentEnrolmentsApiResponse | null> {
  try {
    const response = await apiClient.get<StudentEnrolmentsApiResponse>(
      `/admin/v2/${location}/student/${studentId}/enrolments`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching student enrolments:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
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
      message: apiError.response?.data?.message || "Failed to fetch student enrolments",
    };
  }
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed student information from the API
 * Endpoint: GET /admin/v2/{location}/student/{studentId}/info
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @returns Promise resolving to the student details response or null on error
 */
export async function getStudentDetails(
  location: string,
  studentId: string
): Promise<StudentDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<StudentDetailsApiResponse>(
      `/admin/v2/${location}/student/${studentId}/info`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching student details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          student: {
            id: Number(studentId) || 0,
            fullName: "",
            birthDate: "",
            age: "",
            gender: "",
            status: "Inactive",
            note: "",
          },
          customer: {
            id: 0,
            name: "",
            phone: "",
          },
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch student details",
    };
  }
}

