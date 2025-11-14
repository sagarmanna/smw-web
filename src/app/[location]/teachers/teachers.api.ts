import { apiClient } from '@/lib/api/client';
import { mockTeachersData } from './mockData/mockData';

// Teacher Details Update API
export interface UpdateTeacherDetailsData {
  firstName: string;
  lastName: string;
  birthDate?: string;
}

export interface UpdateTeacherDetailsResponse {
  status: boolean;
  message?: string;
  errors?: string[];
}

export async function updateTeacherDetails(
  location: string,
  teacherId: number,
  data: UpdateTeacherDetailsData
): Promise<UpdateTeacherDetailsResponse> {
  try {
    const response = await apiClient.put<UpdateTeacherDetailsResponse>(
      `/admin/v2/${location}/teachers/${teacherId}/details`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating teacher details:", error);
    return {
      status: false,
      message: "Failed to update teacher details",
    };
  }
}

export interface TeacherRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

export interface TeachersListResponse {
  success: boolean;
  message: string;
  data: {
    body: TeacherRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TeachersQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: "active" | "inactive";
  sort?: 'firstName' | 'lastName' | 'email' | 'phone';
  order?: 'asc' | 'desc';
}

// Teacher Info Data Interfaces
export interface TeacherInfoData {
  success: boolean;
  data: {
    profile: {
      name: string;
      role: string;
      birthDate?: string;
      picture?: string;
    };
    email: Array<{
      id: number;
      label: string;
      email: string;
      note?: string;
      isPrimary?: boolean;
    }>;
    phone: Array<{
      id: number;
      label: string;
      number: string;
      extension?: string;
      note?: string;
    }>;
    addresses: Array<{
      id: number;
      label: string;
      address: string;
      city: string;
      cityId: number;
      provinceId: number;
      countryId: number;
      postalCode: string;
      note?: string;
      isPrimary?: boolean;
    }>;
  };
}

// Qualifications Interfaces
export interface Qualification {
  id: number;
  name: string;
  rate?: number;
  description?: string;
  dateObtained?: string;
}

export interface QualificationsResponse {
  success: boolean;
  data: Qualification[];
}

// NOTE: API is not ready yet, this function will be implemented when backend is available
export async function getTeachers(
  _location: string,
  _query: TeachersQuery
): Promise<TeachersListResponse | null> {
  // TODO: Implement actual API call when backend is ready
  // For now, return null to indicate API is not available
  console.log('Teachers API not implemented yet, using mock data in component');
  return null;
  
  /* 
  // Future implementation when API is ready:
  try {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit == -1 ? '99999' : query.limit.toString());
    if (query.firstName) params.append('firstName', query.firstName);
    if (query.lastName) params.append('lastName', query.lastName);
    if (query.email) params.append('email', query.email);
    if (query.phone) params.append('phone', query.phone);
    if (query.sort) params.append('sort', query.sort);
    if (query.order) params.append('order', query.order);

    const response = await apiClient.get<TeachersListResponse>(
      `/admin/v2/${location}/teachers`,
      { params }
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error fetching teachers:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch teachers',
      data: {
        body: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1
        }
      }
    };
  }
  */
}

export async function getTeacherById(
  _location: string,
  _id: number
): Promise<TeacherRow | null> {
  try {
    // TODO: Implement actual API call when backend is ready
    return null;
  } catch (_error: unknown) {
    return null;
  }
}

// Get detailed teacher information
export async function getTeacherInfo(
  location: string,
  id: number
): Promise<TeacherInfoData | null> {
  try {
    const response = await apiClient.get<TeacherInfoData>(
      `/admin/v2/${location}/teachers/${id}/info`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher info:', error);
    return null;
  }
}

// Get teacher's private qualifications
export async function getTeacherPrivateQualifications(
  location: string,
  id: number
): Promise<QualificationsResponse | null> {
  try {
    const response = await apiClient.get<QualificationsResponse>(
      `/admin/v2/${location}/teachers/${id}/qualifications/private`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching private qualifications:', error);
    return null;
  }
}

// Get teacher's group qualifications
export async function getTeacherGroupQualifications(
  location: string,
  id: number
): Promise<QualificationsResponse | null> {
  try {
    const response = await apiClient.get<QualificationsResponse>(
      `/admin/v2/${location}/teachers/${id}/qualifications/group`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching group qualifications:', error);
    return null;
  }
}

// Export mock data for use in components
export { mockTeachersData };
