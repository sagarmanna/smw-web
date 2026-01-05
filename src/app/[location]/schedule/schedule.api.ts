import { apiClient } from '@/lib/api/client';

export interface Program {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  name: string;
}

export interface ProgramsResponse {
  success: boolean;
  data: Program[];
  message: string;
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
  message: string;
}

export interface ScheduleDetails {
  Availabilities: {
    from: string;
    to: string;
  };
  OperationTimeAvailability: {
    from: string;
    to: string;
  };
  Holiday: {
    id: number;
    date: string;
    description: string;
  };
}

export interface ScheduleDetailsResponse {
  success: boolean;
  data: ScheduleDetails;
  message: string;
}

export interface TeacherViewResource {
  id: number;
  title: string;
}

export interface TeacherViewResponse {
  success: boolean;
  data: {
    resources: TeacherViewResource[];
  };
  message: string;
}

export interface TooltipItem {
  name: string;
  value: string;
}

export interface TeacherViewEvent {
  lessonId: number;
  isOwing: boolean;
  isOwingRentalAgreement: boolean;
  resourceId: number;
  title: string;
  start: string;
  end: string;
  url: string;
  className: string;
  backgroundColor: string;
  tooltip: TooltipItem[];
  isOnline: boolean;
  programId: number | null;
  enrolmentId: number | null;
}

export interface TeacherViewAvailability {
  resourceId: number;
  title: string;
  start: string;
  end: string;
  rendering: string;
  className: string;
}

export interface TeacherViewEventsResponse {
  success: boolean;
  data: {
    lessons: TeacherViewEvent[];
    availability: TeacherViewAvailability[];
    totalEvents: number;
    date: string;
    locationId: number;
  };
  message: string;
}

export interface ClassroomViewResource {
  id: number;
  title: string;
  description: string;
}

export interface ClassroomViewResponse {
  success: boolean;
  data: {
    resources: ClassroomViewResource[];
  };
  message: string;
}

export interface ClassroomViewEvent {
  id: number;
  resourceId: number;
  title: string;
  start: string;
  end: string;
  url: string;
  className: string;
  backgroundColor: string;
  tooltip: TooltipItem[];
}

export interface ClassroomViewAvailability {
  resourceId: number;
  title: string;
  start: string;
  end: string;
  className: string;
  backgroundColor?: string;
  rendering: string;
}

export interface ClassroomViewEventsResponse {
  success: boolean;
  data: {
    events: ClassroomViewEvent[];
    availability: ClassroomViewAvailability[];
    totalEvents: number;
    date: string;
    locationId: number;
  };
  message: string;
}

export async function getProgramsList(): Promise<ProgramsResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<ProgramsResponse>(
      `/admin/v2/programs/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching programs list:", error);
    return null;
  }
}

export async function getTeachersList(location: string): Promise<TeachersResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<TeachersResponse>(
      `/admin/v2/${location}/teachers/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teachers list:", error);
    return null;
  }
}

export async function getTeachersByProgram(location: string, programId: number): Promise<TeachersResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<{ success: boolean; data: { body: Teacher[] }; message: string }>(
      `/admin/v2/${location}/teachers/by-program`,
      {
        params: { programId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Transform the response to match TeachersResponse format
    if (response.data.success && response.data.data?.body) {
      return {
        success: true,
        data: response.data.data.body,
        message: response.data.message || 'Teachers retrieved successfully',
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching teachers by program:", error);
    return null;
  }
}

export async function getScheduleDetails(location: string, date: string): Promise<ScheduleDetailsResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<ScheduleDetailsResponse>(
      `/admin/v2/${location}/schedule/details`,
      {
        params: { date },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule details:", error);
    return null;
  }
}

export async function getTeacherView(
  location: string, 
  date: string, 
  showAll: boolean, 
  programId?: string, 
  teacherId?: string,
  type?: string
): Promise<TeacherViewResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const params: Record<string, string | number> = {
      date,
      showAll: showAll ? 1 : 0
    };

    if (programId) {
      params.programId = programId;
    }

    if (teacherId) {
      params.teacherId = teacherId;
    }

    if (type) {
      params.type = type;
    }

    const response = await apiClient.get<TeacherViewResponse>(
      `/admin/v2/${location}/schedule/teacher-view`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher view:", error);
    return null;
  }
}

export async function getTeacherViewEvents(
  location: string, 
  date: string, 
  showAll: boolean, 
  programId?: string, 
  teacherId?: string
): Promise<TeacherViewEventsResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const params: Record<string, string | number> = {
      date,
      showAll: showAll ? 1 : 0
    };

    if (programId) {
      params.programId = programId;
    }

    if (teacherId) {
      params.teacherId = teacherId;
    }

    const response = await apiClient.get<TeacherViewEventsResponse>(
      `/admin/v2/${location}/schedule/teacher-view/events`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher view events:", error);
    return null;
  }
}

export async function getClassroomViewResources(location: string): Promise<ClassroomViewResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<ClassroomViewResponse>(
      `/admin/v2/${location}/schedule/classroom-view/resources`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching classroom view resources:", error);
    return null;
  }
}

export async function getClassroomViewEvents(
  location: string, 
  date: string
): Promise<ClassroomViewEventsResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const params: Record<string, string> = {
      date
    };

    const response = await apiClient.get<ClassroomViewEventsResponse>(
      `/admin/v2/${location}/schedule/classroom-view/events`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching classroom view events:", error);
    return null;
  }
}

export interface ValidatePrivateLessonRequest {
  programId: number;
  teacherId: number;
  date: string; // Format: 'YYYY-MM-DD HH:mm:ss'
  duration: string; // Format: 'HH:mm:ss'
  isOnline?: boolean;
}

export interface ValidatePrivateLessonResponse {
  success: boolean;
  data?: Record<string, string[]>; // Field name -> array of error messages
  message?: string;
  errorCode?: string;
}

export async function validatePrivateLesson(
  location: string,
  studentId: string,
  data: ValidatePrivateLessonRequest
): Promise<ValidatePrivateLessonResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post<ValidatePrivateLessonResponse>(
      `/admin/v2/${location}/lesson/validate-private`,
      data,
      {
        params: { studentId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error validating private lesson:", error);
    // Return error response if available
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ValidatePrivateLessonResponse } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    return null;
  }
}

export interface CreatePrivateLessonRequest {
  programId: number;
  teacherId: number;
  date: string; // Format: 'YYYY-MM-DD HH:mm:ss'
  duration: string; // Format: 'HH:mm:ss'
  isOnline?: boolean;
}

export interface CreatePrivateLessonResponse {
  success: boolean;
  data?: {
    lessonId: number;
    url?: string;
  };
  errors?: Record<string, string[]>; // Field name -> array of error messages
  message?: string;
  errorCode?: string;
}

export async function createPrivateLesson(
  location: string,
  studentId: string,
  data: CreatePrivateLessonRequest
): Promise<CreatePrivateLessonResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.post<CreatePrivateLessonResponse>(
      `/admin/v2/${location}/extra-lesson/create-private`,
      data,
      {
        params: { studentId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating private lesson:", error);
    // Return error response if available
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: CreatePrivateLessonResponse } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    return null;
  }
}
