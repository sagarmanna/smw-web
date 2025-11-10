import { apiClient } from '@/lib/api/client';

export interface CustomerMergeData {
  id: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface GetCustomersForMergeResponse {
  success: boolean;
  message?: string;
  data: {
    body: CustomerMergeData[];
    pagination?: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface MergePreviewData {
  primaryCandidate: {
    id: number;
    isActive: boolean;
    fullName: string;
  };
  duplicateCandidate: {
    id: number;
    isActive: boolean;
    fullName: string;
  };
  students: Array<{
    id: number;
    fullName: string;
  }>;
  enrolments: Array<{
    id: number;
    studentName: string;
    programName: string;
    teacherName: string;
    day: string;
    fromTime: string;
    duration: string;
    startDate: string;
    renewalDate: string;
  }>;
}

export interface GetMergePreviewResponse {
  success: boolean;
  message: string;
  data: {
    body: MergePreviewData;
  };
}

/**
 * Get list of customers available for merging (excluding the current customer)
 * @param location - The location identifier
 * @param currentCustomerId - The current customer ID to exclude from results
 * @param lastName - Optional last name filter for search
 * @returns Promise with the list of customers
 */
export async function getCustomersForMerge(
  location: string,
  currentCustomerId: number,
  lastName?: string
): Promise<GetCustomersForMergeResponse | null> {
  try {
    const params: Record<string, string | number> = {};
    if (lastName) {
      params.lastName = lastName;
    }

    const response = await apiClient.get<GetCustomersForMergeResponse>(
      `/admin/v2/${location}/customers/${currentCustomerId}/merge`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error fetching customers for merge:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch customers',
      data: {
        body: []
      }
    };
  }
}

/**
 * Get merge preview showing what will happen when merging customers
 * @param location - The location identifier
 * @param originalCustomerId - The original customer ID (to keep)
 * @param duplicateCustomerId - The duplicate customer ID (to merge)
 * @returns Promise with the merge preview data
 */
export async function getMergePreview(
  location: string,
  originalCustomerId: number,
  duplicateCustomerId: number
): Promise<GetMergePreviewResponse | null> {
  try {
    const response = await apiClient.get<GetMergePreviewResponse>(
      `/admin/v2/${location}/customers/${originalCustomerId}/merge-preview`,
      {
        params: {
          customerId: duplicateCustomerId
        }
      }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error fetching merge preview:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch merge preview',
      data: {
        body: {
          primaryCandidate: { id: 0, isActive: false, fullName: '' },
          duplicateCandidate: { id: 0, isActive: false, fullName: '' },
          students: [],
          enrolments: []
        }
      }
    };
  }
}