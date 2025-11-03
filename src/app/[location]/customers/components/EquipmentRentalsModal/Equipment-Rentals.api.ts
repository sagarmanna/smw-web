import { apiClient } from '@/lib/api/client';

// API Response Interfaces
export interface InstrumentRental {
  id: number;
  code: string;
  description: string;
  price: number;
}

export interface Student {
  id: number;
  fullName: string;
}

export interface CustomerInfo {
  customerName: string;
  address: string;
  city: string;
  postalCode: string;
  homePhone: string;
  workPhone: string;
  otherPhone: string;
  email: string;
}

export interface EquipmentRentalsData {
  instrumentRentals: InstrumentRental[];
  students: Student[];
  customerInfo: CustomerInfo;
}

export interface GetEquipmentRentalsResponse {
  success: boolean;
  message: string;
  data: {
    body: EquipmentRentalsData;
  };
}

/**
 * Get equipment rentals modal data (info endpoint)
 * This fetches all available instruments, students, and customer information
 * 
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with equipment rentals data
 */
export async function getEquipmentRentalsInfo(
  location: string,
  customerId: number
): Promise<GetEquipmentRentalsResponse | null> {
  try {
    const response = await apiClient.get<GetEquipmentRentalsResponse>(
      `/admin/v2/${location}/customers/${customerId}/equipment-rentals/info`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error fetching equipment rentals info:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch equipment rentals info',
      data: {
        body: {
          instrumentRentals: [],
          students: [],
          customerInfo: {
            customerName: '',
            address: '',
            city: '',
            postalCode: '',
            homePhone: '',
            workPhone: '',
            otherPhone: '',
            email: ''
          }
        }
      }
    };
  }
}

/**
 * Get equipment rentals modal data for update (info endpoint with rental ID)
 * This fetches existing rental data along with available instruments, students, and customer info
 * 
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param rentalId - The rental ID to fetch for editing
 * @returns Promise with equipment rentals data
 */
export async function getEquipmentRentalsInfoForUpdate(
  location: string,
  customerId: number,
  rentalId: number
): Promise<GetEquipmentRentalsResponse | null> {
  try {
    const response = await apiClient.get<GetEquipmentRentalsResponse>(
      `/admin/v2/${location}/customers/${customerId}/equipment-rentals/info`,
      {
        params: { id: rentalId }
      }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error fetching equipment rentals info for update:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch equipment rentals info',
      data: {
        body: {
          instrumentRentals: [],
          students: [],
          customerInfo: {
            customerName: '',
            address: '',
            city: '',
            postalCode: '',
            homePhone: '',
            workPhone: '',
            otherPhone: '',
            email: ''
          }
        }
      }
    };
  }
}