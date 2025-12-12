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
// Evaluations API Response Types
// ---------------------------------------------

export interface StudentEvaluationResponse {
  id: number;
  programId: number;
  date: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export interface StudentEvaluationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentEvaluationsApiResponse {
  success: boolean;
  data: {
    body: StudentEvaluationResponse[];
    pagination?: StudentEvaluationsPagination;
  };
  pagination?: StudentEvaluationsPagination;
  message?: string;
}

/**
 * Fetches student evaluations from the API with pagination
 * Endpoint: GET /admin/v2/{location}/student/{studentId}/evaluations?page={page}&limit={limit}
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param page - Page number (default: 1)
 * @param limit - Number of records per page (default: 10)
 * @returns Promise resolving to the evaluations response or null on error
 */
export async function getStudentEvaluations(
  location: string,
  studentId: string,
  page: number = 1,
  limit: number = 10
): Promise<StudentEvaluationsApiResponse | null> {
  try {
    const response = await apiClient.get<StudentEvaluationsApiResponse>(
      `/admin/v2/${location}/student/${studentId}/evaluations`,
      {
        params: {
          page,
          limit,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching student evaluations:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch student evaluations",
    };
  }
}

// ---------------------------------------------
// Evaluation Mutation API Types
// ---------------------------------------------

export interface CreateEvaluationRequest {
  date: string; // YYYY-MM-DD format
  mark: number;
  level: string;
  programId: number;
  type: string;
  teacherId: number;
}

export interface EvaluationApiResponse {
  success: boolean;
  data?: StudentEvaluationResponse | {
    body: StudentEvaluationResponse;
  };
  message?: string;
}

/**
 * Creates/Updates an evaluation for a student
 * Endpoint: POST /admin/v2/{location}/student/{studentId}/evaluations
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param data - The evaluation data to create/update
 * @returns Promise resolving to the evaluation response or null on error
 */
export async function createStudentEvaluation(
  location: string,
  studentId: string,
  data: CreateEvaluationRequest
): Promise<EvaluationApiResponse | null> {
  try {
    const response = await apiClient.post<EvaluationApiResponse>(
      `/admin/v2/${location}/student/${studentId}/evaluations`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating student evaluation:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to save evaluation",
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

