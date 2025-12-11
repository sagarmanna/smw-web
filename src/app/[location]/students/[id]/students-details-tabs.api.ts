import {
  PrivateLessonData,
  GroupLessonData,
  AbsentLessonData,
  UnscheduledLessonData,
  CommentData,
  HistoryData,
} from './studentTabConfigs';

// ---------------------------------------------
// Private Lessons API Response Types
// ---------------------------------------------

export interface PrivateLessonApiResponse {
  success: boolean;
  data: {
    body: PrivateLessonData[];
  };
  message?: string;
}

// ---------------------------------------------
// Group Lessons API Response Types
// ---------------------------------------------

export interface GroupLessonApiResponse {
  success: boolean;
  data: {
    body: GroupLessonData[];
  };
  message?: string;
}

// ---------------------------------------------
// Absent Lessons API Response Types
// ---------------------------------------------

export interface AbsentLessonApiResponse {
  success: boolean;
  data: {
    body: AbsentLessonData[];
  };
  message?: string;
}

// ---------------------------------------------
// Unscheduled Lessons API Response Types
// ---------------------------------------------

export interface UnscheduledLessonApiResponse {
  success: boolean;
  data: {
    body: UnscheduledLessonData[];
  };
  message?: string;
}

// ---------------------------------------------
// Comments API Response Types
// ---------------------------------------------

export interface CommentItem {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface CommentsApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsApiResponse {
  success: boolean;
  data: {
    body: CommentItem[];
    pagination: CommentsApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface HistoryItem {
  id: number;
  message: string;
  createdOn: string;
}

export interface HistoryApiResponsePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HistoryApiResponse {
  success: boolean;
  data: {
    body: HistoryItem[];
    pagination: HistoryApiResponsePagination;
  };
  message?: string;
}

// ---------------------------------------------
// Mock Data (for development)
// ---------------------------------------------

/**
 * Generates mock private lessons data for a student
 */
function generateMockPrivateLessons(studentId: string): PrivateLessonData[] {
  const studentIndex = parseInt(studentId) || 1;
  const programs = ["Piano Core", "Guitar Fundamentals", "Violin Basics", "Music Theory", "Drums Essential"];
  const program = programs[(studentIndex - 1) % programs.length];
  
  return [
    { dueDate: "Sep 15, 2025", programName: program, date: "Oct 11, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Sep 15, 2025", programName: program, date: "Oct 18, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Sep 15, 2025", programName: program, date: "Oct 25, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 01, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 08, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 15, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 22, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Nov 15, 2025", programName: program, date: "Dec 06, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
  ];
}

/**
 * Generates mock group lessons data for a student
 */
function generateMockGroupLessons(studentId: string): GroupLessonData[] {
  const studentIndex = parseInt(studentId) || 1;
  const programs = ["xPiano Contemporary", "Guitar Ensemble", "Violin Group", "Music Theory Group", "Drums Collective"];
  const program = programs[(studentIndex - 1) % programs.length];
  
  return [
    // Group 1: Sep 15, 2025 - 1 lesson with Rescheduled status
    { dueDate: "Sep 15, 2025", programName: program, date: "Oct 16, 2025 @ 07:30 PM", duration: "02:30", status: "Rescheduled", price: 143.75, owing: 143.75, online: "No" },
    
    // Group 2: Oct 15, 2025 - 5 lessons
    { dueDate: "Oct 15, 2025", programName: program, date: "Oct 23, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Oct 30, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 06, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 13, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Oct 15, 2025", programName: program, date: "Nov 20, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    
    // Group 3: Nov 15, 2025 - 4 lessons
    { dueDate: "Nov 15, 2025", programName: program, date: "Nov 27, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Nov 15, 2025", programName: program, date: "Dec 04, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Nov 15, 2025", programName: program, date: "Dec 11, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
    { dueDate: "Nov 15, 2025", programName: program, date: "Dec 18, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75, online: "No" },
  ];
}

/**
 * Generates mock absent lessons data for a student
 */
function generateMockAbsentLessons(studentId: string): AbsentLessonData[] {
  const studentIndex = parseInt(studentId) || 1;
  const programs = ["Piano Core", "Guitar Fundamentals", "Violin Basics", "Music Theory", "Drums Essential"];
  const teachers = ["Art Tatum", "Jimi Hendrix", "Itzhak Perlman", "Johann Bach", "Buddy Rich"];
  const program = programs[(studentIndex - 1) % programs.length];
  const teacher = teachers[(studentIndex - 1) % teachers.length];
  
  return [
    { date: "Sep 28, 2025 @ 02:30 PM", program: program, teacher: teacher, duration: "00:30", invoiceId: "INV-001", online: "No" },
    { date: "Oct 05, 2025 @ 02:30 PM", program: program, teacher: teacher, duration: "00:30", invoiceId: "INV-002", online: "No" },
  ];
}

/**
 * Generates mock unscheduled lessons data for a student
 */
function generateMockUnscheduledLessons(studentId: string): UnscheduledLessonData[] {
  // Mock data removed - returning empty array
  return [];
}

/**
 * Generates mock comments data for a student
 */
function generateMockComments(studentId: string): CommentData[] {
  const studentIndex = parseInt(studentId) || 1;
  const teachers = ["Art Tatum", "Jimi Hendrix", "Itzhak Perlman", "Johann Bach", "Buddy Rich"];
  const teacher = teachers[(studentIndex - 1) % teachers.length];
  const basicStudents = [
    { firstName: "Anna" }, { firstName: "Anna" }, { firstName: "Anwar" }, { firstName: "Angelina" },
    { firstName: "Amy" }, { firstName: "Amit" }, { firstName: "Alison" }, { firstName: "Alicia" },
    { firstName: "Alicia" }, { firstName: "Alice" }, { firstName: "Alex" }, { firstName: "Alessia" },
    { firstName: "Alessia" }, { firstName: "ajay" }, { firstName: "abbanda" },
  ];
  const firstName = basicStudents[(studentIndex - 1) % basicStudents.length]?.firstName || "Student";
  
  return [
    { date: "Oct 08, 2025", author: teacher, comment: `${firstName} is making excellent progress. Keep up the great work!` },
    { date: "Sep 15, 2025", author: teacher, comment: "Great performance in today's lesson. Very enthusiastic learner." },
    { date: "Aug 22, 2025", author: "Admin", comment: "Parent requested to reschedule lessons for September." },
  ];
}

/**
 * Generates mock history data for a student
 */
function generateMockHistory(studentId: string): HistoryData[] {
  const studentIndex = parseInt(studentId) || 1;
  const teachers = ["Art Tatum", "Jimi Hendrix", "Itzhak Perlman", "Johann Bach", "Buddy Rich"];
  const teacher = teachers[(studentIndex - 1) % teachers.length];
  
  return [
    { message: "Oct 10, 2025 - Lesson Scheduled: Private lesson scheduled for Nov 01, 2025 by System" },
    { message: "Oct 08, 2025 - Comment Added: Teacher added progress comment by " + teacher },
    { message: "Oct 05, 2025 - Absence Recorded: Student absent from lesson by Admin" },
    { message: "Sep 27, 2025 - Profile Updated: Phone number updated by Admin" },
    { message: "Sep 15, 2025 - Payment Received: Payment of $130.00 received by System" },
  ];
}

// ---------------------------------------------
// Private Lessons API
// ---------------------------------------------

/**
 * Fetches private lessons for a student
 * Endpoint: GET /admin/v2/{location}/students/{studentId}/private-lessons
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentPrivateLessons(
  location: string,
  studentId: string
): Promise<PrivateLessonApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/students/${studentId}/private-lessons`;
    // const response = await apiClient.get<PrivateLessonApiResponse>(url);
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: generateMockPrivateLessons(studentId),
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching private lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch private lessons"
    );
    return null;
  }
}

// ---------------------------------------------
// Group Lessons API
// ---------------------------------------------

/**
 * Fetches group lessons for a student
 * Endpoint: GET /admin/v2/{location}/students/{studentId}/group-lessons
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentGroupLessons(
  location: string,
  studentId: string
): Promise<GroupLessonApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/students/${studentId}/group-lessons`;
    // const response = await apiClient.get<GroupLessonApiResponse>(url);
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: generateMockGroupLessons(studentId),
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching group lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch group lessons"
    );
    return null;
  }
}

// ---------------------------------------------
// Absent Lessons API
// ---------------------------------------------

/**
 * Fetches absent lessons for a student
 * Endpoint: GET /admin/v2/{location}/students/{studentId}/absent-lessons
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentAbsentLessons(
  location: string,
  studentId: string
): Promise<AbsentLessonApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/students/${studentId}/absent-lessons`;
    // const response = await apiClient.get<AbsentLessonApiResponse>(url);
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: generateMockAbsentLessons(studentId),
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching absent lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch absent lessons"
    );
    return null;
  }
}

// ---------------------------------------------
// Unscheduled Lessons API
// ---------------------------------------------

/**
 * Fetches unscheduled lessons for a student
 * Endpoint: GET /admin/v2/{location}/students/{studentId}/unscheduled-lessons
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentUnscheduledLessons(
  location: string,
  studentId: string
): Promise<UnscheduledLessonApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/students/${studentId}/unscheduled-lessons`;
    // const response = await apiClient.get<UnscheduledLessonApiResponse>(url);
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        body: generateMockUnscheduledLessons(studentId),
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching unscheduled lessons:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch unscheduled lessons"
    );
    return null;
  }
}

// ---------------------------------------------
// Comments API
// ---------------------------------------------

/**
 * Fetches comments data for a student
 * Endpoint: GET /admin/v2/{location}/comments
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID (passed as id param with type=student)
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentComments(
  location: string,
  studentId: string
): Promise<CommentsApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/comments`;
    // const response = await apiClient.get<CommentsApiResponse>(url, {
    //   params: {
    //     type: 'student',
    //     id: studentId,
    //   },
    // });
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const mockComments = generateMockComments(studentId);
    const commentItems: CommentItem[] = mockComments.map((comment, index) => ({
      id: index + 1,
      content: comment.comment,
      createdUser: comment.author,
      avatar: "",
      createdOn: comment.date,
    }));

    return {
      success: true,
      data: {
        body: commentItems,
        pagination: {
          page: 1,
          limit: 10,
          total: commentItems.length,
          totalPages: 1,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching comments:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch comments"
    );
    return null;
  }
}

// ---------------------------------------------
// History API
// ---------------------------------------------

/**
 * Fetches history data for a student
 * Endpoint: GET /admin/v2/{location}/history
 * 
 * @param location - The location identifier (e.g., "burlington")
 * @param studentId - The student ID (passed as id param with type=student)
 * @returns Promise resolving to raw API response data or null on error
 */
export async function getStudentHistory(
  location: string,
  studentId: string
): Promise<HistoryApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const url = `/admin/v2/${location}/history`;
    // const response = await apiClient.get<HistoryApiResponse>(url, {
    //   params: {
    //     type: 'student',
    //     id: studentId,
    //   },
    // });
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const mockHistory = generateMockHistory(studentId);
    const historyItems: HistoryItem[] = mockHistory.map((item, index) => ({
      id: index + 1,
      message: item.message,
      createdOn: item.message.split(" - ")[0] || new Date().toISOString(),
    }));

    return {
      success: true,
      data: {
        body: historyItems,
        pagination: {
          page: 1,
          limit: 10,
          total: historyItems.length,
          totalPages: 1,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching history:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error(
      "API Error:",
      apiError.response?.data?.message || "Failed to fetch history"
    );
    return null;
  }
}
