import { apiClient } from '@/lib/api/client';

export interface ChangeLessonRequest {
  programId: number;
  teacherId: number;
  lessonIds: number[];
}

export interface ChangeLessonResponse {
  success: boolean;
  data?: {
    processedCount: number;
    lessons: Array<{
      oldLessonId: number;
      newLessonId: number;
    }>;
  };
  message?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

/**
 * Change group lessons to private extra lessons
 * POST /admin/v2/:location/course/change
 * Body: { programId, teacherId, lessonIds: [123, 456] }
 */
export async function changeLessons(
  location: string,
  lessonIds: number[],
  data: Omit<ChangeLessonRequest, 'lessonIds'>
): Promise<ChangeLessonResponse> {
  try {
    const requestBody: ChangeLessonRequest = {
      ...data,
      lessonIds,
    };

    const response = await apiClient.post<ChangeLessonResponse>(
      `/admin/v2/${location}/course/change`,
      requestBody
    );

    return response.data;
  } catch (error) {
    // Handle error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ChangeLessonResponse } };
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to change lessons';
    throw new Error(errorMessage);
  }
}

