import { apiClient } from '@/lib/api/client';
import { mockTeachersData } from './mockData/mockData';

export interface TeacherRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  sort?: 'firstName' | 'lastName' | 'email' | 'phone';
  order?: 'asc' | 'desc';
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

// Export mock data for use in components
export { mockTeachersData };
