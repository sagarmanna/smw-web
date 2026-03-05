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

// Set Password API
export interface SetPasswordRequest {
  password?: string;
  confirmPassword?: string;
  pin?: number;
  /**
   * Optional merge flag for modules that support it (e.g. Owners).
   * Represented as a numeric flag (0/1) or boolean; omitted for modules
   * that do not use merge semantics.
   */
  merge?: number | boolean;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
  data: {
    status: boolean;
  };
}

export interface SetPasswordErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Set password and/or PIN for a user
 * @param location - Location slug
 * @param userId - User ID
 * @param data - Password data (password, confirmPassword, optional pin)
 * @returns Success response with status
 */
export async function setUserPassword(
  location: string,
  userId: number | string,
  data: SetPasswordRequest
): Promise<SetPasswordResponse> {
  try {
    const response = await apiClient.post<SetPasswordResponse>(
      `/admin/v2/${location}/user/${userId}/set-password`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error setting user password:', error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: SetPasswordErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as SetPasswordErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || 'Failed to set password',
    } as SetPasswordErrorResponse;
  }
}

// User Import API
export interface UserImportResponse {
  successCount: number;
  studentCount: number;
  customerCount: number;
  errors: string[];
  totalRows: number;
}

export interface UserImportApiResponse {
  success: boolean;
  message: string;
  data: UserImportResponse;
}

export interface UserImportErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Import users (customers) and students from a CSV file.
 * @param location - Location slug
 * @param file - CSV file (File from input or drag-drop)
 * @returns Import result with counts and any row errors
 */
export async function importUsersCsv(
  location: string,
  file: File
): Promise<UserImportApiResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UserImportApiResponse>(
      `/admin/v2/${location}/user/import`,
      formData,
      {
        headers: {
          ...apiClient.defaults.headers.common,
          'Content-Type': undefined,
        } as Record<string, string | undefined>,
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error importing users CSV:', error);
    const axiosError = error as { response?: { data?: UserImportErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as UserImportErrorResponse;
    }
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || 'Failed to import CSV',
    } as UserImportErrorResponse;
  }
}

