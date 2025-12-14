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
 * @param showAll - Whether to show all enrolments (default: false)
 * @returns Promise resolving to the enrolments response or null on error
 */
export async function getStudentEnrolments(
  location: string,
  studentId: string,
  showAll: boolean = false
): Promise<StudentEnrolmentsApiResponse | null> {
  try {
    const response = await apiClient.get<StudentEnrolmentsApiResponse>(
      `/admin/v2/${location}/student/${studentId}/enrolments`,
      {
        params: {
          showAll: showAll ? "true" : undefined,
        },
      }
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
 * Fetches student evaluations from the API with pagination and optional sorting
 * Endpoint: GET /admin/v2/{location}/student/{studentId}/evaluations?page={page}&limit={limit}&sort={sort}&order={order}
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param page - Page number (default: 1)
 * @param limit - Number of records per page (default: 10)
 * @param sort - Optional field to sort by (e.g., "mark", "level")
 * @param order - Optional sort direction ("asc" or "desc")
 * @returns Promise resolving to the evaluations response or null on error
 */
export async function getStudentEvaluations(
  location: string,
  studentId: string,
  page: number = 1,
  limit: number = 10,
  sort?: string,
  order?: "asc" | "desc"
): Promise<StudentEvaluationsApiResponse | null> {
  try {
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    
    // Only add sorting parameters if provided (not on initial load)
    if (sort && order) {
      params.sort = sort;
      params.order = order;
    }
    
    const response = await apiClient.get<StudentEvaluationsApiResponse>(
      `/admin/v2/${location}/student/${studentId}/evaluations`,
      { params }
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
  data?: StudentEvaluationResponse;
  message?: string;
}

/**
 * Creates an evaluation for a student
 * Endpoint: POST /admin/v2/{location}/student/{studentId}/evaluations
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param data - The evaluation data to create
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

/**
 * Updates an evaluation for a student
 * Endpoint: PUT /admin/v2/{location}/student/{studentId}/evaluations?evaluationId={evaluationId}
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param evaluationId - The evaluation ID to update
 * @param data - The evaluation data to update
 * @returns Promise resolving to the evaluation response or null on error
 */
export async function updateStudentEvaluation(
  location: string,
  studentId: string,
  evaluationId: number,
  data: CreateEvaluationRequest
): Promise<EvaluationApiResponse | null> {
  try {
    const response = await apiClient.put<EvaluationApiResponse>(
      `/admin/v2/${location}/student/${studentId}/evaluations`,
      data,
      {
        params: {
          evaluationId,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating student evaluation:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update evaluation",
    };
  }
}

/**
 * Deletes an evaluation for a student
 * Endpoint: DELETE /admin/v2/{location}/student/{studentId}/evaluations?evaluationId={evaluationId}
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param evaluationId - The evaluation ID to delete
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteStudentEvaluation(
  location: string,
  studentId: string,
  evaluationId: number
): Promise<EvaluationApiResponse | null> {
  try {
    const response = await apiClient.delete<EvaluationApiResponse>(
      `/admin/v2/${location}/student/${studentId}/evaluations`,
      {
        params: {
          evaluationId,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error deleting student evaluation:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete evaluation",
    };
  }
}

// ---------------------------------------------
// Details fetch and update
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

// ---------------------------------------------
// Update Student Info API Types
// ---------------------------------------------

export interface UpdateStudentInfoRequest {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD format
  gender: string; // "1" for male, "2" for female, "0" for not specified
  note: string;
}

export interface UpdateStudentInfoResponse {
  success: boolean;
  data: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    customerId: number;
    status: number;
    isDeleted: number;
    gender: string;
    note?: string; // Optional - may or may not be returned by API
  };
  message?: string;
}

/**
 * Updates student information via PUT API
 * Endpoint: PUT /admin/v2/{location}/student/{studentId}/info
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param data - The student data to update
 * @returns Promise resolving to the update response or null on error
 */
export async function updateStudentInfo(
  location: string,
  studentId: string,
  data: UpdateStudentInfoRequest
): Promise<UpdateStudentInfoResponse | null> {
  try {
    const response = await apiClient.put<UpdateStudentInfoResponse>(
      `/admin/v2/${location}/student/${studentId}/info`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating student info:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        id: Number(studentId) || 0,
        firstName: "",
        lastName: "",
        birthDate: "",
        customerId: 0,
        status: 0,
        isDeleted: 0,
        gender: "",
      },
      message: apiError.response?.data?.message || "Failed to update student info",
    };
  }
}

// ---------------------------------------------
// Delete Student Info API Types
// ---------------------------------------------

export interface DeleteStudentInfoResponse {
  success: boolean;
  message?: string;
}

/**
 * Deletes student information via DELETE API
 * Endpoint: DELETE /admin/v2/{location}/student/{studentId}/info
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteStudentInfo(
  location: string,
  studentId: string
): Promise<DeleteStudentInfoResponse | null> {
  try {
    const response = await apiClient.delete<DeleteStudentInfoResponse>(
      `/admin/v2/${location}/student/${studentId}/info`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error deleting student info:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete student info",
    };
  }
}

// ---------------------------------------------
// Gender Conversion Helpers
// ---------------------------------------------

/**
 * Converts gender from API format to display format
 * API format: "1" = Male, "2" = Female, "0" = Not Specified
 * Display format: "Male", "Female", "Not Specified"
 */
export function genderApiToDisplay(apiGender: string | undefined): string | undefined {
  if (!apiGender) return undefined;
  const normalized = apiGender.trim();
  if (normalized === "1") return "Male";
  if (normalized === "2") return "Female";
  if (normalized === "0") return "Not Specified";
  // If already in display format or unknown, return as is
  return apiGender;
}

/**
 * Converts gender from display format to API format
 * Display format: "Male", "Female", "Not Specified"
 * API format: "1" = Male, "2" = Female, "0" = Not Specified
 */
export function genderDisplayToApi(displayGender: string | undefined): string {
  if (!displayGender) return "0";
  const normalized = displayGender.trim().toLowerCase();
  if (normalized === "male") return "1";
  if (normalized === "female") return "2";
  if (normalized === "not specified" || normalized === "other") return "0";
  // If already in API format, return as is
  if (normalized === "1" || normalized === "2" || normalized === "0") return normalized;
  // Default to "0" for unknown values
  return "0";
}

