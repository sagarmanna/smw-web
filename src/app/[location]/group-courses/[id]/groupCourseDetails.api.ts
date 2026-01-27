import { apiClient } from "@/lib/api/client";

export interface GroupCourseDetailsResponse {
  id: number;
  course: string;
  teacher: string;
  teacherId: number;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
  program: string;
  programId: number;
  status: string;
  isOnline: boolean;
}

export interface GroupCourseDetailsApiResponse {
  success: boolean;
  data: {
    body: GroupCourseDetailsResponse;
  };
  message?: string;
}

// Course Info API Response Types
export interface CourseInfoResponse {
  course: {
    id: number;
    program: string;
    teacher: string;
    rate: string;
    online: string;
  };
  schedule: {
    id: number;
    duration: string;
    time: string;
    period: string;
  };
}

export interface CourseInfoApiResponse {
  success: boolean;
  data: {
    body: CourseInfoResponse;
  };
  message?: string;
}

// Course Lessons API Response Types
export interface CourseLesson {
  id: number;
  date: string;
  status: string;
  online?: string;
}

export interface CourseLessonsApiResponse {
  success: boolean;
  data: {
    body: CourseLesson[];
  };
  message?: string;
}

// Course Students API Response Types
export interface CourseStudent {
  id: number;
  enrolmentId: number;
  studentId: number;
  customerId: number;
  studentName: string;
  customerName: string;
  discount: string;
}

interface CourseStudentsApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseStudentsApiResponse {
  success: boolean;
  data: {
    body: CourseStudent[];
    pagination: CourseStudentsApiResponsePagination;
  };
  message?: string;
  errorCode?: string;
}

// Course History API Response Types
export interface CourseHistory {
  id: number;
  message: string;
  createdOn: string;
}

export interface CourseHistoryApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseHistoryApiResponse {
  success: boolean;
  data: {
    body: CourseHistory[];
    pagination: CourseHistoryApiResponsePagination;
  };
  message?: string;
  errorCode?: string;
}

// Email Statement API Response Types
export interface GroupCourseEmailTemplate {
  id: number;
  subject: string;
  header: string;
  footer: string;
}

export interface GroupCourseEmailLesson {
  id: number;
  teacherName: string;
  date: string;
  status: string;
}

export interface GroupCourseEmailStatementBody {
  enrolment: {
    id: number;
    studentId: number;
    studentName: string;
    customerId: number;
    customerName: string;
    courseId: number;
    programName: string;
    teacherName: string;
    startDate: string;
    endDate: string;
  };
  emails: string[];
  emailTemplate: GroupCourseEmailTemplate;
  lessons: GroupCourseEmailLesson[];
  schedules: Array<{
    id: number;
    day: number;
    dayName: string;
    fromTime: string;
    duration: string;
  }>;
  totalLessons: number;
  remainingLessons: number;
}

export interface GroupCourseEmailStatementApiResponse {
  success: boolean;
  data: {
    body: GroupCourseEmailStatementBody;
  };
  message?: string;
}

/**
 * Fetches group course email statement data from the API
 * Endpoint: GET /admin/v2/{location}/course/{courseId}/email-statement
 * 
 * @param location - The location identifier
 * @param courseId - The course ID
 * @returns Promise resolving to the email statement response or null on error
 */
export async function getGroupCourseEmailStatement(
  location: string,
  courseId: number
): Promise<GroupCourseEmailStatementApiResponse | null> {
  try {
    const response = await apiClient.get<GroupCourseEmailStatementApiResponse>(
      `/admin/v2/${location}/course/${courseId}/email-statement`
    );
    
    if (!response.data.success || !response.data.data?.body) {
      // Return response with error message if available, otherwise null
      return response.data.success === false ? response.data : null;
    }
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    // Return error response object with API error message
      return {
      success: false,
      data: {
        body: {
          enrolment: {
            id: courseId || 0,
            studentId: 0,
            studentName: "",
            customerId: 0,
            customerName: "",
            courseId: courseId || 0,
            programName: "",
            teacherName: "",
            startDate: "",
            endDate: "",
          },
          emails: [],
          emailTemplate: {
            id: 0,
            subject: "",
            header: "",
            footer: "",
          },
          lessons: [],
          schedules: [],
          totalLessons: 0,
          remainingLessons: 0,
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch group course email statement",
    };
  }
}

/**
 * Fetches course info from the API
 * Endpoint: GET /admin/v2/${location}/course/{courseId}/info
 * 
 * @param location - The location identifier 
 * @param courseId - The course ID
 * @returns Promise resolving to the course info response or null on error
 */
export async function getCourseInfo(
  location: string,
  courseId: number
): Promise<CourseInfoApiResponse | null> {
  try {
    const response = await apiClient.get<CourseInfoApiResponse>(
      `/admin/v2/${location}/course/${courseId}/info`
    );
    
    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course info:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {} as CourseInfoResponse,
      },
      message: apiError.response?.data?.message || "Failed to fetch course info",
    };
  }
}

/**
 * Fetches course lessons from the API
 * Endpoint: GET /admin/v2/{location}/course/{courseId}/lessons
 * 
 * @param location - The location identifier 
 * @param courseId - The course ID
 * @returns Promise resolving to the lessons response or null on error
 */
export async function getCourseLessons(
  location: string,
  courseId: number
): Promise<CourseLessonsApiResponse | null> {
  try {
    const response = await apiClient.get<CourseLessonsApiResponse>(
      `/admin/v2/${location}/course/${courseId}/lessons`
    );
    
    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: [],
      },
      message: apiError.response?.data?.message || "Failed to fetch course lessons",
    };
  }
}

/**
 * Fetches course students from the API with pagination
 * Endpoint: GET /admin/v2/{location}/course/{courseId}/students?page={page}&limit={limit}
 * 
 * @param location - The location identifier 
 * @param courseId - The course ID
 * @param page - The page number for pagination (default: 1)
 * @param limit - The number of items per page (default: 20)
 * @returns Promise resolving to the students response or null on error
 */
export async function getCourseStudents(
  location: string,
  courseId: number,
  page: number = 1,
  limit: number = 20
): Promise<CourseStudentsApiResponse | null> {
  try {
    const response = await apiClient.get<CourseStudentsApiResponse>(
      `/admin/v2/${location}/course/${courseId}/students`,
      {
        params: {
          page,
          limit,
        },
      }
    );
    
    // Handle API responses that indicate failure (even with 200 status)
    if (!response.data.success) {
      // Return the error response so it can be handled properly
      return response.data;
    }
    
    if (!response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return response.data;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course students:", error);
    const apiError = error as { 
      response?: { 
        status?: number;
        data?: { 
          message?: string;
          errorCode?: string;
          success?: boolean;
        } 
      } 
    };
    
    // Extract error message from API response
    const errorMessage = apiError.response?.data?.message || "Failed to fetch course students";
    const errorCode = apiError.response?.data?.errorCode;
    
    // Return error response structure that matches API format
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
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

/**
 * Fetches course history from the API
 * Endpoint: GET /admin/v2/{location}/history?type=course&id={courseId}&page={page}
 *
 * @param location - The location identifier
 * @param courseId - The course ID
 * @param page - The page number for pagination (default: 1)
 * @returns Promise resolving to the history response or null on error
 */
export async function getCourseHistory(
  location: string,
  courseId: number,
  page: number = 1
): Promise<CourseHistoryApiResponse | null> {
  try {
    const response = await apiClient.get<CourseHistoryApiResponse>(
      `/admin/v2/${location}/history`,
      {
        params: {
          type: "course",
          id: courseId,
          page,
        },
      }
    );

    // Handle API responses that indicate failure (even with 200 status)
    if (!response.data.success) {
      // Return the error response so it can be handled properly
      return response.data;
    }

    if (!response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course history:", error);
    const apiError = error as { 
      response?: { 
        status?: number;
        data?: { 
          message?: string;
          errorCode?: string;
          success?: boolean;
        } 
      } 
    };
    
    // Extract error message from API response
    const errorMessage = apiError.response?.data?.message || "Failed to fetch course history";
    const errorCode = apiError.response?.data?.errorCode;
    
    // Return error response structure that matches API format
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
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

// Delete Group Course API Response Types
export interface DeleteGroupCourseApiResponse {
  success: boolean;
  data?: {
    url: string;
  };
  message?: string;
  errorCode?: string;
}

/**
 * Deletes a group course
 * Endpoint: DELETE /admin/v2/{location}/course/{courseId}
 * 
 * @param location - The location identifier
 * @param courseId - The course ID to delete
 * @returns Promise resolving to the delete response or null on error
 */
export async function deleteGroupCourse(
  location: string,
  courseId: number
): Promise<DeleteGroupCourseApiResponse | null> {
  try {
    const response = await apiClient.delete<DeleteGroupCourseApiResponse>(
      `/admin/v2/${location}/course/${courseId}`
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error deleting group course:", error);
    const apiError = error as { 
      response?: { 
        status?: number;
        data?: { 
          message?: string;
          errorCode?: string;
          success?: boolean;
        } 
      } 
    };
    
    // Extract error message from API response
    const errorMessage = apiError.response?.data?.message || "Failed to delete group course";
    const errorCode = apiError.response?.data?.errorCode;
    
    // Return error response structure that matches API format
    return {
      success: false,
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

// Edit Online Type API Response Types
export interface EditOnlineTypeRequest {
  lessonIds: number[];
  online: number; // 0 for In Class, 1 for Online
}

export interface EditOnlineTypeApiResponse {
  success: boolean;
  data?: {
    courseId: number;
    updatedBy: number;
  };
  message?: string;
  errorCode?: string;
}

/**
 * Edits online type for group course lessons
 * Endpoint: PUT /admin/v2/{location}/course/edit-online-type/{courseId}
 * 
 * @param location - The location identifier
 * @param courseId - The course ID
 * @param payload - The request payload with lessonIds and online status
 * @returns Promise resolving to the edit online type response or null on error
 */
export async function editOnlineType(
  location: string,
  courseId: number,
  payload: EditOnlineTypeRequest
): Promise<EditOnlineTypeApiResponse | null> {
  try {
    const response = await apiClient.put<EditOnlineTypeApiResponse>(
      `/admin/v2/${location}/course/edit-online-type/${courseId}`,
      payload
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error editing online type:", error);
    const apiError = error as { 
      response?: { 
        status?: number;
        data?: { 
          message?: string;
          errorCode?: string;
          success?: boolean;
        } 
      } 
    };
    
    // Extract error message from API response
    const errorMessage = apiError.response?.data?.message || "Failed to edit online type";
    const errorCode = apiError.response?.data?.errorCode;
    
    // Return error response structure that matches API format
    return {
      success: false,
      message: errorMessage,
      ...(errorCode && { errorCode }),
    };
  }
}

