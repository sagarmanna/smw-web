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
  extension: string | number;
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

type StaffMemberInfoType = "email" | "phone" | "addresses";
type StaffMemberInfoMethod = "post" | "put" | "delete";

/**
 * Helper function to build staff member info API URL
 */
const getStaffMemberInfoUrl = (location: string, staffMemberId: number) =>
  `/admin/v2/${location}/user/${staffMemberId}/info/staffmember`;

// ---------------------------------------------
// Validate email
// ---------------------------------------------

export interface ValidateStaffMemberEmailResponse {
  success: boolean;
  data: {
    exists: boolean;
  };
  message?: string;
}

/**
 * Validate if an email already exists for a user in the location
 * Endpoint: GET /admin/v2/{location}/user/validate-email?email=...
 */
export async function validateStaffMemberEmail(
  location: string,
  email: string
): Promise<ValidateStaffMemberEmailResponse | null> {
  try {
    const response = await apiClient.get<ValidateStaffMemberEmailResponse>(
      `/admin/v2/${location}/user/validate-email?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: { exists: false },
      message: apiError.response?.data?.message || "Failed to validate email",
    };
  }
}

interface StaffMemberInfoBaseRequest<TType extends StaffMemberInfoType, TData> {
  type: TType;
  data: TData;
}

interface StaffMemberInfoDeleteRequest<TType extends StaffMemberInfoType> {
  type: TType;
  id: number | string;
}

export interface StaffMemberInfoMutationResponse<TItem> {
  success: boolean;
  message: string;
  data: TItem[];
}

const createStaffMemberInfoErrorResponse = <TItem>(
  defaultMessage: string,
  error: unknown
): StaffMemberInfoMutationResponse<TItem> => {
  const apiError = error as { response?: { data?: { message?: string } } };

  return {
    success: false,
    message: apiError.response?.data?.message || defaultMessage,
    data: [],
  };
};

async function staffMemberInfoMutation<TItem, TBody>(
  method: StaffMemberInfoMethod,
  location: string,
  staffMemberId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<StaffMemberInfoMutationResponse<TItem> | null> {
  try {
    const url = getStaffMemberInfoUrl(location, staffMemberId);

    const response = await apiClient[method]<StaffMemberInfoMutationResponse<TItem>>(
      url,
      method === "delete" ? { data: body } : body
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Staff member info API error:", error);
    return createStaffMemberInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

// ---------------------------------------------
// Update staff member profile types
// ---------------------------------------------

export interface UpdateStaffMemberProfileRequest {
  firstname: string;
  lastname: string;
}

export interface UpdateStaffMemberProfileResponse {
  success: boolean;
  data?: {
    name: string;
    role: string;
    status: string;
    birthDate: string;
    referralSource: string;
  };
  message: string;
}

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

// ---------------------------------------------
// Update staff member profile
// ---------------------------------------------

/**
 * Updates staff member profile information
 * Endpoint: PUT /admin/v2/{location}/user/{id}/info/staffmember
 *
 * @param location - The location identifier
 * @param staffMemberId - The staff member user ID
 * @param data - The updated profile data (firstname, lastname)
 * @returns Promise resolving to the update response
 */
export async function updateStaffMemberProfile(
  location: string,
  staffMemberId: number,
  data: UpdateStaffMemberProfileRequest
): Promise<UpdateStaffMemberProfileResponse> {
  try {
    const response = await apiClient.put<UpdateStaffMemberProfileResponse>(
      getStaffMemberInfoUrl(location, staffMemberId),
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
    console.error("Error updating staff member profile:", error);

    const apiError = error as {
      response?: {
        data?: UpdateStaffMemberProfileResponse;
      };
      message?: string;
    };

    if (apiError.response?.data) {
      throw apiError.response.data;
    }

    return {
      success: false,
      message: apiError.message || "Failed to update staff member profile",
    };
  }
}

// ---------------------------------------------
// Email API
// ---------------------------------------------

export type CreateStaffMemberEmailRequest = StaffMemberInfoBaseRequest<
  "email",
  {
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type UpdateStaffMemberEmailRequest = StaffMemberInfoBaseRequest<
  "email",
  {
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type StaffMemberEmailApiResponse =
  StaffMemberInfoMutationResponse<StaffMemberEmailResponse>;

export async function addStaffMemberEmail(
  location: string,
  staffMemberId: number,
  emailData: CreateStaffMemberEmailRequest["data"]
): Promise<StaffMemberEmailApiResponse | null> {
  const requestBody: CreateStaffMemberEmailRequest = {
    type: "email",
    data: emailData,
  };

  return staffMemberInfoMutation<
    StaffMemberEmailResponse,
    CreateStaffMemberEmailRequest
  >("post", location, staffMemberId, requestBody, "Failed to add email");
}

export async function updateStaffMemberEmail(
  location: string,
  staffMemberId: number,
  id: number,
  emailData: Omit<UpdateStaffMemberEmailRequest["data"], "id">
): Promise<StaffMemberEmailApiResponse | null> {
  const requestBody: UpdateStaffMemberEmailRequest = {
    type: "email",
    data: {
      id,
      ...emailData,
    },
  };

  return staffMemberInfoMutation<
    StaffMemberEmailResponse,
    UpdateStaffMemberEmailRequest
  >("put", location, staffMemberId, requestBody, "Failed to update email");
}

export async function deleteStaffMemberEmail(
  location: string,
  staffMemberId: number,
  id: number | string
): Promise<StaffMemberEmailApiResponse | null> {
  const requestBody: StaffMemberInfoDeleteRequest<"email"> = {
    type: "email",
    id: String(id),
  };

  return staffMemberInfoMutation<
    StaffMemberEmailResponse,
    StaffMemberInfoDeleteRequest<"email">
  >("delete", location, staffMemberId, requestBody, "Failed to delete email");
}

// ---------------------------------------------
// Phone API
// ---------------------------------------------

export interface StaffMemberPhoneData {
  number: string;
  extension?: string | number;
  note?: string;
  label: string;
  isPrimary?: boolean;
}

export type CreateStaffMemberPhoneRequest = StaffMemberInfoBaseRequest<
  "phone",
  StaffMemberPhoneData
>;

export type UpdateStaffMemberPhoneRequest = StaffMemberInfoBaseRequest<
  "phone",
  StaffMemberPhoneData & { id: number }
>;

export type StaffMemberPhoneApiResponse =
  StaffMemberInfoMutationResponse<StaffMemberPhoneResponse>;

export async function addStaffMemberPhone(
  location: string,
  staffMemberId: number,
  phoneData: StaffMemberPhoneData
): Promise<StaffMemberPhoneApiResponse | null> {
  const requestBody: CreateStaffMemberPhoneRequest = {
    type: "phone",
    data: phoneData,
  };

  return staffMemberInfoMutation<
    StaffMemberPhoneResponse,
    CreateStaffMemberPhoneRequest
  >("post", location, staffMemberId, requestBody, "Failed to add phone");
}

export async function updateStaffMemberPhone(
  location: string,
  staffMemberId: number,
  id: number,
  phoneData: StaffMemberPhoneData
): Promise<StaffMemberPhoneApiResponse | null> {
  const requestBody: UpdateStaffMemberPhoneRequest = {
    type: "phone",
    data: {
      id,
      ...phoneData,
    },
  };

  return staffMemberInfoMutation<
    StaffMemberPhoneResponse,
    UpdateStaffMemberPhoneRequest
  >("put", location, staffMemberId, requestBody, "Failed to update phone");
}

export async function deleteStaffMemberPhone(
  location: string,
  staffMemberId: number,
  id: number | string
): Promise<StaffMemberPhoneApiResponse | null> {
  const requestBody: StaffMemberInfoDeleteRequest<"phone"> = {
    type: "phone",
    id: String(id),
  };

  return staffMemberInfoMutation<
    StaffMemberPhoneResponse,
    StaffMemberInfoDeleteRequest<"phone">
  >("delete", location, staffMemberId, requestBody, "Failed to delete phone");
}

// ---------------------------------------------
// Address API
// ---------------------------------------------

export interface StaffMemberAddressData {
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  label: string;
  isPrimary: boolean;
}

export type CreateStaffMemberAddressRequest = StaffMemberInfoBaseRequest<
  "addresses",
  StaffMemberAddressData
>;

export type UpdateStaffMemberAddressRequest = StaffMemberInfoBaseRequest<
  "addresses",
  StaffMemberAddressData & { id: number }
>;

export type StaffMemberAddressApiResponse =
  StaffMemberInfoMutationResponse<StaffMemberAddressResponse>;

export async function addStaffMemberAddress(
  location: string,
  staffMemberId: number,
  addressData: StaffMemberAddressData
): Promise<StaffMemberAddressApiResponse | null> {
  const requestBody: CreateStaffMemberAddressRequest = {
    type: "addresses",
    data: addressData,
  };

  return staffMemberInfoMutation<
    StaffMemberAddressResponse,
    CreateStaffMemberAddressRequest
  >("post", location, staffMemberId, requestBody, "Failed to add address");
}

export async function updateStaffMemberAddress(
  location: string,
  staffMemberId: number,
  id: number,
  addressData: StaffMemberAddressData
): Promise<StaffMemberAddressApiResponse | null> {
  const requestBody: UpdateStaffMemberAddressRequest = {
    type: "addresses",
    data: {
      id,
      ...addressData,
    },
  };

  return staffMemberInfoMutation<
    StaffMemberAddressResponse,
    UpdateStaffMemberAddressRequest
  >("put", location, staffMemberId, requestBody, "Failed to update address");
}

export async function deleteStaffMemberAddress(
  location: string,
  staffMemberId: number,
  id: number | string
): Promise<StaffMemberAddressApiResponse | null> {
  const requestBody: StaffMemberInfoDeleteRequest<"addresses"> = {
    type: "addresses",
    id: String(id),
  };

  return staffMemberInfoMutation<
    StaffMemberAddressResponse,
    StaffMemberInfoDeleteRequest<"addresses">
  >("delete", location, staffMemberId, requestBody, "Failed to delete address");
}
