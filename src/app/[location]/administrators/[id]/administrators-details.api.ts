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

type AdministratorInfoType = "email" | "phone" | "addresses";
type AdministratorInfoMethod = "post" | "put" | "delete";

/**
 * Helper function to build administrator info API URL
 */
const getAdministratorInfoUrl = (location: string, administratorId: number) =>
  `/admin/v2/${location}/user/${administratorId}/info/administrator`;

interface AdministratorInfoBaseRequest<TType extends AdministratorInfoType, TData> {
  type: TType;
  data: TData;
}

interface AdministratorInfoDeleteRequest<TType extends AdministratorInfoType> {
  type: TType;
  id: number | string;
}

export interface AdministratorInfoMutationResponse<TItem> {
  success: boolean;
  message: string;
  data: TItem[];
}

const createAdministratorInfoErrorResponse = <TItem>(
  defaultMessage: string,
  error: unknown
): AdministratorInfoMutationResponse<TItem> => {
  const apiError = error as { response?: { data?: { message?: string } } };

  return {
    success: false,
    message: apiError.response?.data?.message || defaultMessage,
    data: [],
  };
};

async function administratorInfoMutation<TItem, TBody>(
  method: AdministratorInfoMethod,
  location: string,
  administratorId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<AdministratorInfoMutationResponse<TItem> | null> {
  try {
    const url = getAdministratorInfoUrl(location, administratorId);

    // For DELETE requests, axios requires the body in config.data
    // For POST/PUT, axios accepts the body as the second parameter directly
    const response = await apiClient[method]<AdministratorInfoMutationResponse<TItem>>(
      url,
      method === "delete" ? { data: body } : body
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Administrator info API error:", error);
    return createAdministratorInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

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

// ---------------------------------------------
// Email API
// ---------------------------------------------

export type CreateAdministratorEmailRequest = AdministratorInfoBaseRequest<
  "email",
  {
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type UpdateAdministratorEmailRequest = AdministratorInfoBaseRequest<
  "email",
  {
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type AdministratorEmailApiResponse =
  AdministratorInfoMutationResponse<AdministratorEmailResponse>;

/**
 * Adds a new email for an administrator
 * Endpoint: POST /admin/v2/{location}/user/{administratorId}/info/administrator
 */
export async function addAdministratorEmail(
  location: string,
  administratorId: number,
  emailData: CreateAdministratorEmailRequest["data"]
): Promise<AdministratorEmailApiResponse | null> {
  const requestBody: CreateAdministratorEmailRequest = {
    type: "email",
    data: emailData,
  };

  return administratorInfoMutation<AdministratorEmailResponse, CreateAdministratorEmailRequest>(
    "post",
    location,
    administratorId,
    requestBody,
    "Failed to add email"
  );
}

/**
 * Updates an existing email for an administrator
 * Endpoint: PUT /admin/v2/{location}/user/{administratorId}/info/administrator
 */
export async function updateAdministratorEmail(
  location: string,
  administratorId: number,
  id: number,
  emailData: Omit<UpdateAdministratorEmailRequest["data"], "id">
): Promise<AdministratorEmailApiResponse | null> {
  const requestBody: UpdateAdministratorEmailRequest = {
    type: "email",
    data: {
      id,
      ...emailData,
    },
  };

  return administratorInfoMutation<AdministratorEmailResponse, UpdateAdministratorEmailRequest>(
    "put",
    location,
    administratorId,
    requestBody,
    "Failed to update email"
  );
}

/**
 * Deletes an email for an administrator
 * Endpoint: DELETE /admin/v2/{location}/user/{administratorId}/info/administrator
 * Body: { "type": "email", "id": "<emailId>" }
 */
export async function deleteAdministratorEmail(
  location: string,
  administratorId: number,
  id: number | string
): Promise<AdministratorEmailApiResponse | null> {
  const requestBody: AdministratorInfoDeleteRequest<"email"> = {
    type: "email",
    id: String(id), // Ensure id is always a string
  };

  return administratorInfoMutation<AdministratorEmailResponse, AdministratorInfoDeleteRequest<"email">>(
    "delete",
    location,
    administratorId,
    requestBody,
    "Failed to delete email"
  );
}

// ---------------------------------------------
// Phone API
// ---------------------------------------------

export interface AdministratorPhoneData {
  number: string;
  extension?: string | number;
  note?: string;
  label: string;
  isPrimary?: boolean;
}

export type CreateAdministratorPhoneRequest = AdministratorInfoBaseRequest<
  "phone",
  AdministratorPhoneData
>;

export type UpdateAdministratorPhoneRequest = AdministratorInfoBaseRequest<
  "phone",
  AdministratorPhoneData & { id: number }
>;

export type AdministratorPhoneApiResponse =
  AdministratorInfoMutationResponse<AdministratorPhoneResponse>;

export async function addAdministratorPhone(
  location: string,
  administratorId: number,
  phoneData: AdministratorPhoneData
): Promise<AdministratorPhoneApiResponse | null> {
  const requestBody: CreateAdministratorPhoneRequest = {
    type: "phone",
    data: phoneData,
  };

  return administratorInfoMutation<AdministratorPhoneResponse, CreateAdministratorPhoneRequest>(
    "post",
    location,
    administratorId,
    requestBody,
    "Failed to add phone"
  );
}

export async function updateAdministratorPhone(
  location: string,
  administratorId: number,
  id: number,
  phoneData: AdministratorPhoneData
): Promise<AdministratorPhoneApiResponse | null> {
  const requestBody: UpdateAdministratorPhoneRequest = {
    type: "phone",
    data: {
      id,
      ...phoneData,
    },
  };

  return administratorInfoMutation<AdministratorPhoneResponse, UpdateAdministratorPhoneRequest>(
    "put",
    location,
    administratorId,
    requestBody,
    "Failed to update phone"
  );
}

export async function deleteAdministratorPhone(
  location: string,
  administratorId: number,
  id: number | string
): Promise<AdministratorPhoneApiResponse | null> {
  const requestBody: AdministratorInfoDeleteRequest<"phone"> = {
    type: "phone",
    id: String(id), // Ensure id is always a string
  };

  return administratorInfoMutation<AdministratorPhoneResponse, AdministratorInfoDeleteRequest<"phone">>(
    "delete",
    location,
    administratorId,
    requestBody,
    "Failed to delete phone"
  );
}

// ---------------------------------------------
// Address API
// ---------------------------------------------

export interface AdministratorAddressData {
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  label: string;
  isPrimary: boolean;
}

export type CreateAdministratorAddressRequest = AdministratorInfoBaseRequest<
  "addresses",
  AdministratorAddressData
>;

export type UpdateAdministratorAddressRequest = AdministratorInfoBaseRequest<
  "addresses",
  AdministratorAddressData & { id: number }
>;

export type AdministratorAddressApiResponse =
  AdministratorInfoMutationResponse<AdministratorAddressResponse>;

export async function addAdministratorAddress(
  location: string,
  administratorId: number,
  addressData: AdministratorAddressData
): Promise<AdministratorAddressApiResponse | null> {
  const requestBody: CreateAdministratorAddressRequest = {
    type: "addresses",
    data: addressData,
  };

  return administratorInfoMutation<
    AdministratorAddressResponse,
    CreateAdministratorAddressRequest
  >("post", location, administratorId, requestBody, "Failed to add address");
}

export async function updateAdministratorAddress(
  location: string,
  administratorId: number,
  id: number,
  addressData: AdministratorAddressData
): Promise<AdministratorAddressApiResponse | null> {
  const requestBody: UpdateAdministratorAddressRequest = {
    type: "addresses",
    data: {
      id,
      ...addressData,
    },
  };

  return administratorInfoMutation<
    AdministratorAddressResponse,
    UpdateAdministratorAddressRequest
  >("put", location, administratorId, requestBody, "Failed to update address");
}

export async function deleteAdministratorAddress(
  location: string,
  administratorId: number,
  id: number | string
): Promise<AdministratorAddressApiResponse | null> {
  const requestBody: AdministratorInfoDeleteRequest<"addresses"> = {
    type: "addresses",
    id: String(id), // Ensure id is always a string
  };

  return administratorInfoMutation<
    AdministratorAddressResponse,
    AdministratorInfoDeleteRequest<"addresses">
  >("delete", location, administratorId, requestBody, "Failed to delete address");
}
