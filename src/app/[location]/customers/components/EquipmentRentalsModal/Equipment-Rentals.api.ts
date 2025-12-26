import { apiClient } from '@/lib/api/client';

// API Response Interfaces
export interface InstrumentRental {
  id: number;
  code: string;
  description: string;
  price: number;
  taxRate: number;
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

export interface RentedInstrument {
  instrumentId: number;
  instrumentCode: string;
  instrument: string;
  retailValue: string;
  assetTag: string;
  monthlyRate: string;
  numberOfMonths: string;
  total: string;

}

export interface RentalDetails {
  startDate?: string;
  returnDate?: string;
  endDate?: string;
  duration?: number;
  isOnGoing?: boolean | number; // API may return 0/1 as numbers
  securityDeposit?: boolean | number; // API may return 0/1 as numbers
  tenderType?: number;
  depositAmount?: string;
  studentId?: number;
  createdOn?: string;
}

export interface EquipmentRentalsData {
  instrumentRentals: InstrumentRental[];
  students: Student[];
  customerInfo: CustomerInfo;
  rentedInstruments?: RentedInstrument[];
  rentalDetails?: RentalDetails;
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

// New API Response Interfaces
export interface NewApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

// Legacy API Response Interface (for compatibility)
export interface LegacyApiResponse {
  status: boolean;
  data?: unknown;
  errors?: string | string[];
}

/**
 * Transform new API response to legacy format for compatibility
 */
function transformToLegacyResponse<T>(
  response: NewApiResponse<T>
): LegacyApiResponse {
  if (response.success) {
    return {
      status: true,
      data: response.data,
    };
  } else {
    return {
      status: false,
      errors: response.message || 'An error occurred',
    };
  }
}

/**
 * Create equipment rental using new API
 */
export interface CreateEquipmentRentalRequest {
  studentId: number;
  startDate: string; // ISO date string (YYYY-MM-DD)
  returnDate?: string; // ISO date string (optional)
  isOnGoing?: boolean;
  duration?: number | null;
  securityDeposit?: boolean;
  tenderType?: number | null;
  depositAmount?: number | null;
  subTotal: number;
  hst: number;
  total: number;
  instruments: Array<{
    instrumentId: number;
    value?: number; // Retail value
    asset?: string; // Asset tag/serial
    monthlyRate: number;
    months: number;
    total: number;
  }>;
}

export async function createEquipmentRental(
  location: string,
  customerId: number,
  rentalData: CreateEquipmentRentalRequest
): Promise<LegacyApiResponse> {
  try {
    const response = await apiClient.post<NewApiResponse<{ id: number }>>(
      `/admin/v2/${location}/customers/${customerId}/equipment-rentals`,
      rentalData
    );

    return transformToLegacyResponse(response.data);
  } catch (error: unknown) {
    console.error('Error creating equipment rental:', error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to create equipment rental';
    return {
      status: false,
      errors: errorMessage,
    };
  }
}

/**
 * Update equipment rental return date using new API
 */
export interface UpdateEquipmentRentalRequest {
  returnDate: string; // ISO date string (YYYY-MM-DD) - @IsDateString() expects ISO format
}

export async function updateEquipmentRental(
  location: string,
  customerId: number,
  rentalId: number,
  updateData: UpdateEquipmentRentalRequest
): Promise<LegacyApiResponse> {
  try {
    const response = await apiClient.put<NewApiResponse<{ id: number }>>(
      `/admin/v2/${location}/customers/${customerId}/equipment-rentals?rentalId=${rentalId}`,
      updateData
    );

    return transformToLegacyResponse(response.data);
  } catch (error: unknown) {
    console.error('Error updating equipment rental:', error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to update equipment rental';
    return {
      status: false,
      errors: errorMessage,
    };
  }
}

/**
 * Delete equipment rental using new API
 */
export async function deleteEquipmentRental(
  location: string,
  customerId: number,
  rentalId: number
): Promise<LegacyApiResponse> {
  try {
    const response = await apiClient.delete<NewApiResponse<{ id: number }>>(
      `/admin/v2/${location}/customers/${customerId}/equipment-rentals?rentalId=${rentalId}`
    );

    return transformToLegacyResponse(response.data);
  } catch (error: unknown) {
    console.error('Error deleting equipment rental:', error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to delete equipment rental';
    return {
      status: false,
      errors: errorMessage,
    };
  }
}

/**
 * Mark equipment as returned using new API
 */
export async function equipmentReturned(
  location: string,
  customerId: number,
  rentalId: number
): Promise<LegacyApiResponse> {
  try {
    const response = await apiClient.post<NewApiResponse<{ rentalId: number; invoiceId?: number; invoiceNumber?: number }>>(
      `/admin/v2/${location}/customers/${customerId}/return?rentalId=${rentalId}`
    );

    return transformToLegacyResponse(response.data);
  } catch (error: unknown) {
    console.error('Error marking equipment as returned:', error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Failed to mark equipment as returned';
    return {
      status: false,
      errors: errorMessage,
    };
  }
}