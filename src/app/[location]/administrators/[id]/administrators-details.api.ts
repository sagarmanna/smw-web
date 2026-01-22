import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Response types for administrator details
// ---------------------------------------------

export interface AdministratorProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
  referralSource: string;
}

export interface AdministratorEmailResponse {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface AdministratorPhoneResponse {
  id: number;
  number: string;
  extension: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface AdministratorAddressResponse {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface AdministratorDetailsResponseBody {
  profile: AdministratorProfileResponse;
  email: AdministratorEmailResponse[];
  phone: AdministratorPhoneResponse[];
  addresses: AdministratorAddressResponse[];
}

export interface AdministratorDetailsApiResponse {
  success: boolean;
  data: {
    body: AdministratorDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Helper utilities
// ---------------------------------------------

/**
 * Helper function to build administrator info API URL
 */
const getAdministratorInfoUrl = (location: string, administratorId: number) =>
  `/admin/v2/${location}/user/${administratorId}/info/administrator`;

// ---------------------------------------------
// Update administrator profile types
// ---------------------------------------------

export interface UpdateAdministratorProfileRequest {
  firstname: string;
  lastname: string;
}

export interface UpdateAdministratorProfileResponse {
  success: boolean;
  data?: {
    body: AdministratorDetailsResponseBody;
  };
  message: string;
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed administrator information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/administrator
 *
 * @param location - The location identifier
 * @param administratorId - The administrator user ID
 * @returns Promise resolving to the administrator details response or null on error
 */
export async function getAdministratorDetails(
  location: string,
  administratorId: number
): Promise<AdministratorDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<AdministratorDetailsApiResponse>(
      getAdministratorInfoUrl(location, administratorId)
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching administrator details:", error);
    return null;
  }
}

// ---------------------------------------------
// Update administrator profile
// ---------------------------------------------

/**
 * Updates administrator profile information
 * Endpoint: PUT /admin/v2/{location}/user/{id}/info/administrator
 *
 * @param location - The location identifier
 * @param administratorId - The administrator user ID
 * @param data - The updated profile data (firstname, lastname)
 * @returns Promise resolving to the update response
 */
export async function updateAdministratorProfile(
  location: string,
  administratorId: number,
  data: UpdateAdministratorProfileRequest
): Promise<UpdateAdministratorProfileResponse> {
  try {
    const response = await apiClient.put<UpdateAdministratorProfileResponse>(
      getAdministratorInfoUrl(location, administratorId),
      {
        type: "profile",
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating administrator profile:", error);
    
    // Handle API error response
    const apiError = error as { 
      response?: { 
        data?: UpdateAdministratorProfileResponse 
      }; 
      message?: string 
    };
    
    if (apiError.response?.data) {
      throw apiError.response.data;
    }
    
    // Return error response
    return {
      success: false,
      message: apiError.message || "Failed to update administrator profile",
    };
  }
}
