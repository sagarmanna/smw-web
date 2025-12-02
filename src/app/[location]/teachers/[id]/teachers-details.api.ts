import { apiClient } from '@/lib/api/client';

// Response types matching the API structure from the image
export interface TeacherProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
  referralSource: string;
}

export interface TeacherEmailResponse {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherPhoneResponse {
  id: number;
  number: string;
  extension: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherAddressResponse {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherDetailsResponseBody {
  profile: TeacherProfileResponse;
  email: TeacherEmailResponse[];
  phone: TeacherPhoneResponse[];
  addresses: TeacherAddressResponse[];
}

export interface TeacherDetailsApiResponse {
  success: boolean;
  data: {
    body: TeacherDetailsResponseBody;
  };
  message?: string;
}

/**
 * Fetches detailed teacher information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/teacher
 * 
 * @param location - The location identifier
 * @param teacherId - The teacher user ID
 * @returns Promise resolving to the teacher details response or null on error
 */
export async function getTeacherDetails(
  location: string,
  teacherId: number
): Promise<TeacherDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<TeacherDetailsApiResponse>(
      `/admin/v2/${location}/user/${teacherId}/info/teacher`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    return null;
  }
}

// Teacher Qualification Response Types
export interface TeacherQualificationResponse {
  id: number;
  programId: number;
  programName: string;
  rate: string; // API returns formatted string like "$25.00"
  type: number; // 1 for private, likely 2 for group
}

export interface TeacherQualificationsApiResponse {
  success: boolean;
  data: {
    body: TeacherQualificationResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/**
 * Fetches teacher qualifications from the API
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/qualifications?type={type}
 * 
 * @param location - The location identifier
 * @param teacherId - The teacher user ID
 * @param type - The qualification type: "private" or "group"
 * @returns Promise resolving to the qualifications response or null on error
 */
export async function getTeacherQualifications(
  location: string,
  teacherId: number,
  type: "private" | "group"
): Promise<TeacherQualificationsApiResponse | null> {
  try {
    const response = await apiClient.get<TeacherQualificationsApiResponse>(
      `/admin/v2/${location}/teachers/${teacherId}/qualifications`,
      {
        params: {
          type: type,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher qualifications:', error);
    return null;
  }
}