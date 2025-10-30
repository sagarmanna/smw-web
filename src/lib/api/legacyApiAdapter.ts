/**
 * Simple Legacy API Adapter for Lesson Updates
 * Only handles the lesson update functionality
 */

export interface LegacyApiResponse {
  status: boolean;
  url?: string;
  errors?: string[];
}

export interface LessonUpdateData {
  teacherId: string | number;
  date: string; // Format: YYYY-MM-DD HH:mm:ss
  duration: string; // Format: HH:mm:ss
}

export interface ClassroomModifyData {
  classroomId: string | number;
}

/**
 * Update a lesson using the legacy API
 */
export async function updateLesson(
  location: string,
  lessonId: string,
  lessonData: LessonUpdateData
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('Lesson[teacherId]', lessonData.teacherId.toString());
  formData.append('Lesson[date]', lessonData.date);
  formData.append('Lesson[duration]', lessonData.duration);

  const url = `/admin/${location}/lesson/update?id=${lessonId}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

// Export utility functions for date/duration formatting
export const formatDateTimeForLegacy = (date: Date): string => {
  // Format as local time instead of UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDurationForLegacy = (startTime: Date, endTime: Date): string => {
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Modify classroom for a lesson using the legacy API
 */
export async function modifyClassroom(
  location: string,
  lessonId: string,
  classroomData: ClassroomModifyData
): Promise<LegacyApiResponse> {
  const url = `/admin/${location}/lesson/modify-classroom?id=${lessonId}&classroomId=${classroomData.classroomId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Set a user's password using the legacy API
 */
export async function setUserPassword(
  location: string,
  userId: string | number,
  password: string,
  confirmPassword: string
): Promise<LegacyApiResponse> {
  const formData = new FormData();
  formData.append('UserForm[password]', password);
  formData.append('UserForm[confirmPassword]', confirmPassword);

  const url = `/admin/${location}/user/set-password?id=${userId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}