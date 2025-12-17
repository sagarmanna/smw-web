// Mock data for group course details - replace with actual API calls later
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

