import { apiClient } from '@/lib/api/client';

export interface PhoneData {
  id: number;
  number: string;
  extension?: number;
  note?: string;
  label: string;
  isPrimary: boolean;
}

export interface CreatePhoneRequest {
  type: 'phone';
  data: {
    number: string;
    extension?: number;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface UpdatePhoneRequest {
  type: 'phone';
  data: {
    id: number;
    number: string;
    extension?: number;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface DeletePhoneRequest {
  type: 'phone';
  id: string;
}

export interface PhoneResponse {
  success: boolean;
  message: string;
  data: PhoneData[];
}

export interface DeletePhoneResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    deleted: boolean;
  };
  message: string;
}

/**
 * Create a new phone number for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param phoneData - The phone data to create
 * @returns Promise with the created phone data
 */
export async function createCustomerPhone(
  location: string,
  customerId: number,
  phoneData: CreatePhoneRequest['data']
): Promise<PhoneResponse | null> {
  try {
    const requestBody: CreatePhoneRequest = {
      type: 'phone',
      data: phoneData
    };

    const response = await apiClient.post<PhoneResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error creating customer phone:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to create phone',
      data: []
    };
  }
}

/**
 * Update an existing phone number for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param phoneData - The phone data to update (must include id)
 * @returns Promise with the updated phone data
 */
export async function updateCustomerPhone(
  location: string,
  customerId: number,
  phoneData: UpdatePhoneRequest['data']
): Promise<PhoneResponse | null> {
  try {
    const requestBody: UpdatePhoneRequest = {
      type: 'phone',
      data: phoneData
    };

    const response = await apiClient.put<PhoneResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error updating customer phone:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to update phone',
      data: []
    };
  }
}

/**
 * Delete a customer's phone number
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param phoneId - The phone ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteCustomerPhone(
  location: string,
  customerId: number,
  phoneId: string
): Promise<DeletePhoneResponse | null> {
  try {
    const requestBody: DeletePhoneRequest = {
      type: 'phone',
      id: phoneId
    };

    const response = await apiClient.delete<DeletePhoneResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      {
        data: requestBody
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error deleting customer phone:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to delete phone',
      data: {
        id: phoneId,
        type: 'phone',
        deleted: false
      }
    };
  }
}

/**
 * Get customer's phone information
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with the phone data array
 */
export async function getCustomerPhones(
  location: string,
  customerId: number
): Promise<PhoneData[]> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        phone: PhoneData[];
      };
    }>(`/admin/v2/${location}/customers/${customerId}/info`);
    
    if (response.data.success && response.data.data.phone) {
      return response.data.data.phone;
    }
    
    return [];
  } catch (error: unknown) {
    console.error('Error fetching customer phones:', error);
    return [];
  }
}