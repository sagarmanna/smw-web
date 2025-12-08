import { apiClient } from './client';

// Create User API
export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  pin?: number;
  username?: string;
  canMerge?: boolean;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    legacyUrl?: string;
  };
}

export interface CreateUserErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Create a teacher user
 * @param location - Location slug
 * @param data - User creation data
 * @returns Created user data
 */
export async function createTeacherUser(
  location: string,
  data: CreateUserRequest
): Promise<CreateUserResponse> {
  try {
    const response = await apiClient.post<CreateUserResponse>(
      `/admin/v2/${location}/user/create/teacher`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating teacher user:', error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: CreateUserErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as CreateUserErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || 'Failed to create teacher user',
    } as CreateUserErrorResponse;
  }
}

/**
 * Create a user by role (generic endpoint)
 * @param location - Location slug
 * @param role - User role (teacher, customer, administrator, owner, staffmember)
 * @param data - User creation data
 * @returns Created user data
 */
export async function createUserByRole(
  location: string,
  role: 'teacher' | 'customer' | 'administrator' | 'owner' | 'staffmember',
  data: CreateUserRequest
): Promise<CreateUserResponse> {
  try {
    const response = await apiClient.post<CreateUserResponse>(
      `/admin/v2/${location}/user/create/${role}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Error creating ${role} user:`, error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: CreateUserErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as CreateUserErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || `Failed to create ${role} user`,
    } as CreateUserErrorResponse;
  }
}

// Delete User API
export interface DeleteUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    url: string;
    legacyUrl: string;
  };
}

export interface DeleteUserErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Delete a user by role
 * @param location - Location slug
 * @param userId - User ID to delete
 * @param role - User role (teacher, customer, administrator, owner, staffmember)
 * @returns Deleted user data with redirect URLs
 */
export async function deleteUserByRole(
  location: string,
  userId: number,
  role: 'teacher' | 'customer' | 'administrator' | 'owner' | 'staffmember'
): Promise<DeleteUserResponse> {
  try {
    const response = await apiClient.delete<DeleteUserResponse>(
      `/admin/v2/${location}/user/${userId}/${role}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Error deleting ${role} user:`, error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: DeleteUserErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as DeleteUserErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || `Failed to delete ${role}`,
    } as DeleteUserErrorResponse;
  }
}

