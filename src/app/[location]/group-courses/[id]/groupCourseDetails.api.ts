import { apiClient } from "@/lib/api/client";
import { GroupCourseRow } from "../types";

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
    
    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course students:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch course students"
    );
    return null;
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

    if (!response.data.success || !response.data.data?.body) {
      console.error("API returned unsuccessful response:", response.data);
      return null;
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching course history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch course history"
    );
    return null;
  }
}

