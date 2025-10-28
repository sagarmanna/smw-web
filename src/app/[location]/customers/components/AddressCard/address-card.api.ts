// address-card-api.ts
import { apiClient } from '@/lib/api/client';

export interface AddressData {
  id: number;
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  note?: string;
  label: string;
  isPrimary: boolean;
}

export interface GeoData {
  city: Array<{ id: number; name: string }>;
  province: Array<{ id: number; name: string }>;
  country: Array<{ id: number; name: string }>;
}

export interface CreateAddressRequest {
  type: 'addresses';
  data: {
    address: string;
    postalCode: string;
    city: string;
    cityId: number;
    provinceId: number;
    countryId: number;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface UpdateAddressRequest {
  type: 'addresses';
  data: {
    id: number;
    address: string;
    postalCode: string;
    city: string;
    cityId: number;
    provinceId: number;
    countryId: number;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface DeleteAddressRequest {
  type: 'addresses';
  id: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: AddressData[];
}

export interface DeleteAddressResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    deleted: boolean;
  };
  message: string;
}

export interface GeoDataResponse {
  success: boolean;
  data: GeoData;
  message: string;
}

/**
 * Get geodata for locations (cities, provinces, countries)
 * @param type - Type of data to fetch (all/city/province/country)
 * @returns Promise with the geodata
 */
export async function getGeoData(
  type: 'all' | 'city' | 'province' | 'country' = 'all'
): Promise<GeoData | null> {
  try {
    const response = await apiClient.get<GeoDataResponse>(
      `/admin/v2/locations-geodata?type=${type}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  } catch (error: unknown) {
    console.error('Error fetching geodata:', error);
    return null;
  }
}

/**
 * Create a new address for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param addressData - The address data to create
 * @returns Promise with the created address data
 */
export async function createCustomerAddress(
  location: string,
  customerId: number,
  addressData: CreateAddressRequest['data']
): Promise<AddressResponse | null> {
  try {
    const requestBody: CreateAddressRequest = {
      type: 'addresses',
      data: addressData
    };

    const response = await apiClient.post<AddressResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error creating customer address:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to create address',
      data: []
    };
  }
}

/**
 * Update an existing address for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param addressData - The address data to update (must include id)
 * @returns Promise with the updated address data
 */
export async function updateCustomerAddress(
  location: string,
  customerId: number,
  addressData: UpdateAddressRequest['data']
): Promise<AddressResponse | null> {
  try {
    const requestBody: UpdateAddressRequest = {
      type: 'addresses',
      data: addressData
    };

    const response = await apiClient.put<AddressResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error updating customer address:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to update address',
      data: []
    };
  }
}

/**
 * Delete a customer's address
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param addressId - The address ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteCustomerAddress(
  location: string,
  customerId: number,
  addressId: string
): Promise<DeleteAddressResponse | null> {
  try {
    const requestBody: DeleteAddressRequest = {
      type: 'addresses',
      id: addressId
    };

    const response = await apiClient.delete<DeleteAddressResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      {
        data: requestBody
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error deleting customer address:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to delete address',
      data: {
        id: addressId,
        type: 'addresses',
        deleted: false
      }
    };
  }
}

/**
 * Get customer's address information
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with the address data array
 */
export async function getCustomerAddresses(
  location: string,
  customerId: number
): Promise<AddressData[]> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        addresses: AddressData[];
      };
    }>(`/admin/v2/${location}/customers/${customerId}/info`);
    
    if (response.data.success && response.data.data.addresses) {
      return response.data.data.addresses;
    }
    
    return [];
  } catch (error: unknown) {
    console.error('Error fetching customer addresses:', error);
    return [];
  }
}