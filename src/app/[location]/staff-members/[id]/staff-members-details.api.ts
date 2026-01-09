import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Response types for staff member details
// ---------------------------------------------

export interface StaffMemberProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
  referralSource: string;
}

export interface StaffMemberEmailResponse {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface StaffMemberPhoneResponse {
  id: number;
  number: string;
  extension: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface StaffMemberAddressResponse {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface StaffMemberDetailsResponseBody {
  profile: StaffMemberProfileResponse;
  email: StaffMemberEmailResponse[];
  phone: StaffMemberPhoneResponse[];
  addresses: StaffMemberAddressResponse[];
}

export interface StaffMemberDetailsApiResponse {
  success: boolean;
  data: {
    body: StaffMemberDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Helper utilities
// ---------------------------------------------

/**
 * Helper function to build staff member info API URL
 */
const getStaffMemberInfoUrl = (location: string, staffMemberId: number) =>
  `/admin/v2/${location}/user/${staffMemberId}/info/staffmember`;

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed staff member information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/staffmember
 *
 * @param location - The location identifier
 * @param staffMemberId - The staff member user ID
 * @returns Promise resolving to the staff member details response or null on error
 */
export async function getStaffMemberDetails(
  location: string,
  staffMemberId: number
): Promise<StaffMemberDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<StaffMemberDetailsApiResponse>(
      getStaffMemberInfoUrl(location, staffMemberId)
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching staff member details:", error);
    return null;
  }
}
