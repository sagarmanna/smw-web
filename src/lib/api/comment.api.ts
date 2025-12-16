import { apiClient } from './client';

// Create Comment API
export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  data: {
    status: boolean;
    data: {
      body: Array<{
        id: number;
        content: string;
        createdUser: string;
        avatar: string;
        createdOn: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  };
}

export interface CreateCommentErrorResponse {
  success: false;
  errorCode: string;
  message: string;
}

/**
 * Create a new note/comment
 * @param location - Location slug
 * @param instanceId - Instance ID (e.g., customer ID, student ID)
 * @param instanceType - Instance type (1=student, 2=user, 3=lesson, 4=invoice, 5=proforma)
 * @param data - Comment creation data
 * @returns Created note data with comments list
 */
export async function createComment(
  location: string,
  instanceId: number | string,
  instanceType: number,
  data: CreateCommentRequest
): Promise<CreateCommentResponse> {
  try {
    const response = await apiClient.post<CreateCommentResponse>(
      `/admin/v2/${location}/comments?instanceId=${instanceId}&instanceType=${instanceType}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating comment:', error);
    
    // Handle API error response
    const axiosError = error as { response?: { data?: CreateCommentErrorResponse }; message?: string };
    if (axiosError.response?.data) {
      throw axiosError.response.data as CreateCommentErrorResponse;
    }
    
    // Handle network/other errors
    throw {
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: axiosError.message || 'Failed to create comment',
    } as CreateCommentErrorResponse;
  }
}

