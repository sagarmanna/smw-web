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

// Mock implementation - replace with actual API call
export async function getGroupCourseDetails(
  location: string,
  courseId: number
): Promise<GroupCourseDetailsApiResponse | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data - in real implementation, fetch from API
    const mockCourse: GroupCourseDetailsResponse = {
      id: courseId,
      course: "Band",
      teacher: "Daniel Clain",
      teacherId: 1,
      rate: 450.00,
      fromTime: "07:30 PM",
      duration: "01:30",
      startDate: "2025-10-18",
      endDate: "2026-01-03",
      program: "Band",
      programId: 1,
      status: "Active",
      isOnline: false,
    };

    return {
      success: true,
      message: "Group course details fetched successfully",
      data: {
        body: mockCourse,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching group course details:", error);
    return {
      success: false,
      message: "Failed to fetch group course details",
      data: {
        body: {} as GroupCourseDetailsResponse,
      },
    };
  }
}

