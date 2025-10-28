import { apiClient } from '@/lib/api/client';

export interface DiscountData {
  id: number;
  value: number;
}

export interface UpdateDiscountRequest {
  type: 'discount';
  data: {
    value: number;
  };
}

export interface UpdateDiscountResponse {
  success: boolean;
  message: string;
  data: DiscountData;
}

export interface DeleteDiscountResponse {
  success: boolean;
  message: string;
}

/**
 * Update or create a discount for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param discountValue - The discount percentage (0-100)
 * @returns Promise with the updated discount data
 */
export async function updateCustomerDiscount(
  location: string,
  customerId: number,
  discountValue: number
): Promise<UpdateDiscountResponse | null> {
  try {
    const requestBody: UpdateDiscountRequest = {
      type: 'discount',
      data: {
        value: discountValue
      }
    };

    const response = await apiClient.put<UpdateDiscountResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error updating customer discount:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to update discount',
      data: {
        id: 0,
        value: 0
      }
    };
  }
}

/**
 * Delete a customer's discount
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param discountId - The discount ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteCustomerDiscount(
  location: string,
  customerId: number,
  discountId: number
): Promise<DeleteDiscountResponse | null> {
  try {
    const response = await apiClient.delete<DeleteDiscountResponse>(
      `/admin/v2/${location}/customers/${customerId}/discounts/${discountId}`
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error deleting customer discount:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to delete discount'
    };
  }
}

/**
 * Get customer's discount information
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with the discount data
 */
export async function getCustomerDiscount(
  location: string,
  customerId: number
): Promise<DiscountData | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        discount: DiscountData | null;
      };
    }>(`/admin/v2/${location}/customers/${customerId}/info`);
    
    if (response.data.success && response.data.data.discount) {
      return response.data.data.discount;
    }
    
    return null;
  } catch (error: unknown) {
    console.error('Error fetching customer discount:', error);
    return null;
  }
}