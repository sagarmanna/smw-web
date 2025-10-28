import { apiClient } from '@/lib/api/client';

export interface ProfileData {
  name: string;
  role: string;
  referralSource: string;
  referralSourceDescription?: string;
  status: string;
}

export interface UpdateProfileRequest {
  type: 'profile';
  data: {
    firstname: string;
    lastname: string;
    referralSourceId?: number;
    referralSourceDescription?: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

/**
 * Update customer profile (name and referral source)
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param firstName - Customer's first name
 * @param lastName - Customer's last name
 * @param referralSourceId - The referral source ID
 * @param referralSourceDescription - Description for "Other" referral source
 * @returns Promise with the updated profile data
 */
export async function updateCustomerProfile(
  location: string,
  customerId: number,
  firstName: string,
  lastName: string,
  referralSourceId?: number,
  referralSourceDescription?: string
): Promise<UpdateProfileResponse | null> {
  try {
    const requestBody: UpdateProfileRequest = {
      type: 'profile',
      data: {
        firstname: firstName,
        lastname: lastName,
        ...(referralSourceId && { referralSourceId }),
        ...(referralSourceDescription && { referralSourceDescription })
      }
    };

    const response = await apiClient.put<UpdateProfileResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error updating customer profile:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to update profile',
      data: {
        name: '',
        role: '',
        referralSource: '',
        referralSourceDescription: '',
        status: ''
      }
    };
  }
}