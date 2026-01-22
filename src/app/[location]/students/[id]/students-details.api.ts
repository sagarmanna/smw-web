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
  courseId?: number; // Optional: included when creating enrolment for review
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

export interface EnrolmentProgramOption {
  id: number;
  name: string;
  rate?: number | string | null;
}

export interface EnrolmentPaymentFrequencyOption {
  id: number;
  name: string;
  frequencyLength: number;
}

export interface CustomerDiscountInfo {
  value: number;
}

export interface CustomerEnrolmentMetadataResponse {
  success: boolean;
  data: {
    programs: EnrolmentProgramOption[];
    paymentFrequencies: EnrolmentPaymentFrequencyOption[];
    discount: CustomerDiscountInfo | null;
  };
  message?: string;
}

export interface CreateStudentEnrolmentRequest {
  programId: number;
  programRate: number;
  duration: string; // HH:mm
  paymentFrequency: string;
  paymentFrequencyDiscount?: number;
  multipleEnrolDiscount?: number;
  discountedRatePerMonth: number; // Discounted rate per month (with all discounts applied)
  lessonsCount: number;
  autoRenew: boolean;
  startDate: string; // YYYY-MM-DD
  paymentCycleEffectiveDate: string; // YYYY-MM-DD
  isOnline: boolean;
  teacherId: number;
  day: string;
  startTime: string; // HH:mm
}

export interface CreateStudentEnrolmentApiResponse {
  success: boolean;
  data?: StudentEnrolmentResponse;
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

/**
 * Fetches enrolment metadata (programs, payment frequencies, customer discount)
 * for a given customer.
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/enrolment-metadata
 */
export async function getCustomerEnrolmentMetadata(
  location: string,
  customerId: number,
): Promise<CustomerEnrolmentMetadataResponse | null> {
  try {
    const response = await apiClient.get<CustomerEnrolmentMetadataResponse>(
      `/admin/v2/${location}/customers/${customerId}/enrolment-metadata`,
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching customer enrolment metadata:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        programs: [],
        paymentFrequencies: [],
        discount: null,
      },
      message: apiError.response?.data?.message || "Failed to fetch customer enrolment metadata",
    };
  }
}

/**
 * Creates a new private enrolment for a student.
 * Endpoint: POST /admin/v2/{location}/student/{studentId}/enrolments
 */
export async function createStudentEnrolment(
  location: string,
  studentId: string,
  data: CreateStudentEnrolmentRequest,
): Promise<CreateStudentEnrolmentApiResponse | null> {
  try {
    const response = await apiClient.post<CreateStudentEnrolmentApiResponse>(
      `/admin/v2/${location}/student/${studentId}/enrolments`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating student enrolment:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to create enrolment",
    };
  }
}

export interface LessonReviewItem {
  id: number;
  date: string;
  startTime?: string;
  duration: string;
  conflict?: string;
  isHolidayConflict?: boolean;
  isConflict?: boolean;
  isUnscheduled?: boolean;
}

export interface LessonReviewData {
  courseId?: number;
  programName?: string;
  teacherName?: string;
  studentName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  lessons: LessonReviewItem[];
  details?: {
    oldTeacherName?: string;
    newTeacherName?: string;
    studentNames?: string;
    changesFrom?: string;
    isBulkTeacherChange?: boolean;
  };
  summary: {
    holidayConflicted: number;
    conflicted: number;
    unscheduled: number;
    scheduled: number;
    total: number;
  };
}

export interface LessonReviewResponse {
  success: boolean;
  data: LessonReviewData;
  message: string;
}

/**
 * Get lesson review data for a course
 * Endpoint: GET /admin/v2/{location}/lesson/review?courseId=X
 */
export async function getLessonReview(
  location: string,
  courseId: number,
  showAllReviewLessons: boolean = false,
): Promise<LessonReviewResponse | null> {
  try {
    const params = new URLSearchParams();
    params.append('courseId', courseId.toString());
    params.append('showAllReviewLessons', showAllReviewLessons ? '1' : '0');

    const response = await apiClient.get<LessonReviewResponse>(
      `/admin/v2/${location}/lesson/review?${params.toString()}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching lesson review:", error);
    return null;
  }
}

/**
 * Get lesson review data for teacher change (bulk teacher change scenario)
 * Endpoint: GET /admin/v2/{location}/lesson/review-teacher-change?enrolmentIds[]=X&teacherId=Y&changesFrom=Z&isBulkTeacherChange=true
 */
export async function getLessonReviewForTeacherChange(
  location: string,
  enrolmentIds: number[],
  teacherId: number,
  changesFrom: string,
  isBulkTeacherChange: boolean = true,
): Promise<LessonReviewResponse | null> {
  try {
    const params = new URLSearchParams();
    
    // Format: enrolmentIds=31414&enrolmentIds=31415 (repeated params)
    enrolmentIds.forEach((id) => {
      params.append('enrolmentIds', id.toString());
    });
    params.append('teacherId', teacherId.toString());
    params.append('changesFrom', changesFrom);
    if (isBulkTeacherChange) {
      params.append('isBulkTeacherChange', 'true');
    }

    const response = await apiClient.get<LessonReviewResponse>(
      `/admin/v2/${location}/lesson/review-teacher-change?${params.toString()}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching lesson review for teacher change:", error);
    return null;
  }
}

export interface ConfirmLessonsResponse {
  success: boolean;
  message: string;
}

/**
 * Confirm lessons for a course
 * Endpoint: POST /admin/v2/{location}/lesson/confirm?courseId=X
 */
export interface UpdateLessonRequest {
  date?: string; // ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)
  teacherId?: number;
  duration?: string; // HH:mm:ss
}

export async function updateLesson(
  location: string,
  lessonId: number,
  data: UpdateLessonRequest,
): Promise<{ success: boolean; data: unknown; message?: string }> {
  try {
    const response = await apiClient.put(
      `/admin/v2/${location}/lesson/${lessonId}`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating lesson:", error);
    throw error;
  }
}

export interface UpdateLessonFieldRequest {
  id?: number;
  teacherId?: number;
  date?: string; // Can be in various formats
  duration?: string; // HH:mm:ss format
  hour?: string; // Hour (00-23)
  minute?: string; // Minute (00-59)
  goToDate?: string; // Date for goToDate
  applyContext?: string; // '1' for apply all, undefined for single
}

/**
 * Update lesson field (matches legacy update-field endpoint)
 * Endpoint: POST /admin/v2/{location}/lesson/update-field?id=X&LessonReview[enrolmentIds]=
 * 
 * Note: Legacy API uses bracket notation in query params: LessonReview[enrolmentIds]
 * This is handled automatically by axios when passed in params object
 */
export interface UpdateLessonFieldResponse {
  success: boolean;
  data?: {
    updatedCount?: number;
    totalCount?: number;
    id?: number;
    date?: string;
    teacherId?: number;
    duration?: string;
  };
  message?: string;
}

export async function updateLessonField(
  location: string,
  lessonId: number,
  data: UpdateLessonFieldRequest,
  enrolmentIds?: string,
): Promise<UpdateLessonFieldResponse> {
  try {
    // Build query params
    const params: Record<string, string> = { id: lessonId.toString() };
    
    // Add enrolmentIds if provided
    if (enrolmentIds !== undefined && enrolmentIds !== null && enrolmentIds !== '') {
      params['enrolmentIds'] = enrolmentIds;
    }

    const response = await apiClient.post(
      `/admin/v2/${location}/lesson/update-field`,
      data,
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating lesson field:", error);
    throw error;
  }
}

export interface ValidateLessonUpdateRequest {
  id: number;
  teacherId: number;
  date: string; // ISO date string
  duration: string; // HH:mm:ss format
  applyContext?: string; // Optional context (e.g., '1' for apply all)
}

export interface ValidateLessonUpdateResponse {
  success: boolean;
  errorCode?: string;
  message?: string;
  data?: Record<string, string[]>; // Validation errors
}

/**
 * Validate lesson update (when editing lesson date/time/teacher)
 * Endpoint: POST /admin/v2/{location}/lesson/validate-on-update?id=X
 */
export async function validateLessonUpdate(
  location: string,
  lessonId: number,
  data: ValidateLessonUpdateRequest,
): Promise<ValidateLessonUpdateResponse | null> {
  try {
    const response = await apiClient.post<ValidateLessonUpdateResponse>(
      `/admin/v2/${location}/lesson/validate-on-update`,
      data,
      {
        params: { id: lessonId },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Error validating lesson update ${lessonId}:`, error);
    const apiError = error as { response?: { data?: ValidateLessonUpdateResponse } };
    if (apiError.response?.data) {
      return apiError.response.data;
    }
    return null;
  }
}

export async function confirmLessons(
  location: string,
  courseId: number,
): Promise<ConfirmLessonsResponse | null> {
  try {
    const response = await apiClient.post<ConfirmLessonsResponse>(
      `/admin/v2/${location}/lesson/confirm`,
      {},
      {
        params: {
          courseId,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error confirming lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to confirm lessons",
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
// Merge Student APIs
// ---------------------------------------------

export interface MergeStudentListItem {
  id: number;
  fullName: string;
  birthDate?: string;
  customerName?: string;
}

export interface CustomerStudentsForMergeResponse {
  success: boolean;
  data: {
    body: MergeStudentListItem[];
  };
  message?: string;
}

/**
 * Fetches list of students for merge for a given customer, excluding the current student
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/students
 *
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param excludeStudentId - ID of the current student to exclude from the list
 * @param page - Page number (default 1)
 * @param limit - Page size (default 20)
 */
export async function getCustomerStudentsForMerge(
  location: string,
  customerId: number,
  excludeStudentId: string,
  page = 1,
  limit = 20
): Promise<CustomerStudentsForMergeResponse | null> {
  try {
    const response = await apiClient.get<CustomerStudentsForMergeResponse>(
      `/admin/v2/${location}/customers/${customerId}/students`,
      {
        params: {
          page,
          limit,
          excludeStudentId,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching customer students for merge:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message:
        apiError.response?.data?.message ||
        "Failed to fetch students for merge",
    };
  }
}

export interface MergeStudentRequest {
  sourceId: number;
}

export interface MergeStudentResponse {
  success: boolean;
  message?: string;
}

/**
 * Merges a source student into the target student
 * Endpoint: POST /admin/v2/{location}/student/{targetId}/merge
 *
 * @param location - The location identifier
 * @param targetId - The target student ID (current student that will receive the merge)
 * @param sourceId - The source student ID (selected student being merged)
 */
export async function mergeStudent(
  location: string,
  targetId: string,
  sourceId: number
): Promise<MergeStudentResponse | null> {
  try {
    const response = await apiClient.post<MergeStudentResponse>(
      `/admin/v2/${location}/student/${targetId}/merge`,
      {
        sourceId,
      } as MergeStudentRequest
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error merging students:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message:
        apiError.response?.data?.message || "Failed to merge students",
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

// ---------------------------------------------
// Group Course Enrolment API Types
// ---------------------------------------------

export interface GroupCourseOption {
  id: string;
  course: string;
  teacher: string;
  day: string;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface FetchGroupCoursesApiResponse {
  success: boolean;
  data: GroupCourseOption[];
  message?: string;
}

/**
 * Fetches available group courses for a student
 * Endpoint: GET /admin/v2/{location}/course/fetch-group?studentId={studentId}&courseName={courseName}
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param courseName - Optional course name filter
 * @returns Promise resolving to the group courses response or null on error
 */
export async function fetchGroupCourses(
  location: string,
  studentId: string,
  courseName?: string,
): Promise<FetchGroupCoursesApiResponse | null> {
  try {
    const params: Record<string, string | number> = {
      studentId: Number(studentId),
    };
    
    if (courseName) {
      params.courseName = courseName;
    }
    
    const response = await apiClient.get<FetchGroupCoursesApiResponse>(
      `/admin/v2/${location}/course/fetch-group`,
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching group courses:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || "Failed to fetch group courses",
    };
  }
}

// ---------------------------------------------
// Group Enrolment API Types
// ---------------------------------------------

export interface GroupCourseFormRequest {
  studentId: number;
  courseId: number;
  discount?: string;
  discountType?: number; // 0 = percentage, 1 = dollar
}

export interface LessonPreviewDto {
  id: number;
  dateTime: string;
  duration: string;
  price: number;
  discount: number;
  total: number;
}

export interface GroupEnrolmentPreviewResponse {
  success: boolean;
  data: {
    enrolmentId: number;
    lessons: LessonPreviewDto[];
  };
  message?: string;
}

/**
 * Apply group enrolment - creates unconfirmed enrolment, applies discount, returns lesson preview
 * Endpoint: POST /admin/v2/{location}/enrolments/group-apply
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param courseId - The course ID
 * @param discount - Optional discount value
 * @param discountType - Discount type: "fixed" (dollar) or "percentage"
 * @returns Promise resolving to the lesson preview response or null on error
 */
export async function applyGroupEnrolment(
  location: string,
  studentId: string,
  courseId: string,
  discount?: string,
  discountType?: "fixed" | "percentage",
): Promise<GroupEnrolmentPreviewResponse | null> {
  try {
    const params: Record<string, string | number> = {
      studentId: Number(studentId),
      courseId: Number(courseId),
    };

    const body: Record<string, string | number> = {
      studentId: Number(studentId),
      courseId: Number(courseId),
    };

    if (discount) {
      body.discount = discount;
      // Convert UI discount type to API format: fixed = 1 (dollar), percentage = 0
      body.discountType = discountType === "fixed" ? 1 : 0;
    }

    const response = await apiClient.post<GroupEnrolmentPreviewResponse>(
      `/admin/v2/${location}/enrolments/group-apply`,
      body,
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error applying group enrolment:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        enrolmentId: 0,
        lessons: [],
      },
      message: apiError.response?.data?.message || "Failed to apply group enrolment",
    };
  }
}

// ---------------------------------------------
// Group Enrolment Confirm API Types
// ---------------------------------------------

export interface GroupEnrolmentConfirmResponse {
  success: boolean;
  data: {
    enrolmentId: number;
  };
  message?: string;
}

/**
 * Confirm group enrolment - sets isConfirmed=true and creates GroupLesson records
 * Endpoint: POST /admin/v2/{location}/enrolments/group-confirm?enrolmentId={enrolmentId}
 * 
 * @param location - The location identifier
 * @param enrolmentId - The enrolment ID to confirm
 * @returns Promise resolving to the response or null on error
 */
export async function confirmGroupEnrolment(
  location: string,
  enrolmentId: number,
): Promise<GroupEnrolmentConfirmResponse | null> {
  try {
    const params: Record<string, string | number> = {
      enrolmentId: enrolmentId,
    };

    const response = await apiClient.post<GroupEnrolmentConfirmResponse>(
      `/admin/v2/${location}/enrolments/group-confirm`,
      {},
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error confirming group enrolment:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        enrolmentId: enrolmentId,
      },
      message: apiError.response?.data?.message || "Failed to confirm group enrolment",
    };
  }
}

