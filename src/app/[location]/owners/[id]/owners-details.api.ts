import { apiClient } from "@/lib/api/client";
import { mockOwnerData } from "../mockData/ownerMockData";

// ---------------------------------------------
// Shared response types for owner details
// ---------------------------------------------

export interface OwnerProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
  referralSource?: string;
}

export interface OwnerEmailResponse {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface OwnerPhoneResponse {
  id: number;
  number: string;
  extension: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface OwnerAddressResponse {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface OwnerDetailsResponseBody {
  profile: OwnerProfileResponse;
  email: OwnerEmailResponse[];
  phone: OwnerPhoneResponse[];
  addresses: OwnerAddressResponse[];
}

export interface OwnerDetailsApiResponse {
  success: boolean;
  data: {
    body: OwnerDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Helper utilities (DRY)
// ---------------------------------------------

type OwnerInfoType = "email" | "phone" | "addresses";
type OwnerInfoMethod = "post" | "put" | "delete";

interface OwnerInfoBaseRequest<TType extends OwnerInfoType, TData> {
  type: TType;
  data: TData;
}

interface OwnerInfoDeleteRequest<TType extends OwnerInfoType> {
  type: TType;
  id: number | string;
}

export interface OwnerInfoMutationResponse<TItem> {
  success: boolean;
  message: string;
  data: TItem[];
}

const createOwnerInfoErrorResponse = <TItem>(
  defaultMessage: string,
  error: unknown
): OwnerInfoMutationResponse<TItem> => {
  const apiError = error as { response?: { data?: { message?: string } } };

  return {
    success: false,
    message: apiError.response?.data?.message || defaultMessage,
    data: [],
  };
};

/**
 * Helper to build owner info API URL
 * Endpoint: /admin/v2/{location}/user/{ownerId}/info/owner
 */
const getOwnerInfoUrl = (location: string, ownerId: number) =>
  `/admin/v2/${location}/user/${ownerId}/info/owner`;

// ---------------------------------------------
// Mock Data Store (in-memory for session persistence)
// ---------------------------------------------

// In-memory store to persist mock data changes during the session
const mockDataStore: Map<number, OwnerDetailsResponseBody> = new Map();

/**
 * Initialize mock data for an owner if not already in store
 */
function initializeMockData(ownerId: number): OwnerDetailsResponseBody | null {
  if (mockDataStore.has(ownerId)) {
    return mockDataStore.get(ownerId)!;
  }

  // Find the owner in the listing mock data
  const owner = mockOwnerData.find((o) => o.userId === ownerId);

  if (!owner) {
    return null;
  }

  // Generate mock detail data based on the owner
  const fullName = `${owner.firstName} ${owner.lastName}`.trim();

  const mockData: OwnerDetailsResponseBody = {
    profile: {
      name: fullName,
      role: "Owner",
      status: owner.isActive ? "Active" : "Inactive",
      birthDate: ownerId === 1 ? "1985-05-20" : "",
    },
    email: [
      {
        id: ownerId * 100 + 1,
        email: owner.email,
        note: "",
        label: "Work",
        isPrimary: true,
      },
    ],
    phone: ownerId === 1
      ? [
          {
            id: ownerId * 100 + 1,
            number: "(647) 111-2222",
            extension: "",
            note: "",
            label: "Mobile",
            isPrimary: false,
          },
        ]
      : [],
    addresses: ownerId === 1
      ? [
          {
            id: ownerId * 100 + 1,
            address: "456 Oak Avenue",
            city: "Vancouver",
            province: "British Columbia",
            country: "Canada",
            postalCode: "V6B 1C1",
            label: "Home",
            isPrimary: false,
          },
        ]
      : [],
  };

  mockDataStore.set(ownerId, mockData);
  return mockData;
}

/**
 * Get current mock data for mutations
 */
function getCurrentMockData(ownerId: number): OwnerDetailsResponseBody | null {
  return initializeMockData(ownerId);
}

async function ownerInfoMutation<TItem, TBody>(
  method: OwnerInfoMethod,
  location: string,
  ownerId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<OwnerInfoMutationResponse<TItem> | null> {
  try {
    const url = getOwnerInfoUrl(location, ownerId);

    // For DELETE requests, axios requires the body in config.data.
    // For POST/PUT, axios accepts the body as the second parameter directly.
    const response = await apiClient[method]<OwnerInfoMutationResponse<TItem>>(
      url,
      method === "delete" ? { data: body } : body
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Owner info API error:", error);
    return createOwnerInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Helper to create empty owner details response - DRY principle
 */
const createEmptyOwnerDetailsResponse = (): OwnerDetailsApiResponse => ({
  success: false,
  message: "Failed to fetch owner details",
  data: {
    body: {
      profile: {
        name: "",
        role: "Owner",
        status: "Inactive",
        birthDate: "",
        referralSource: "",
      },
      email: [],
      phone: [],
      addresses: [],
    },
  },
});

/**
 * Fetches detailed owner information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/owner
 * 
 * @param location - The location identifier
 * @param ownerId - The owner user ID
 * @returns Promise resolving to OwnerDetailsApiResponse (always returns structured response, never null)
 */
export async function getOwnerDetails(
  location: string,
  ownerId: number
): Promise<OwnerDetailsApiResponse> {
  try {
    const response = await apiClient.get<OwnerDetailsApiResponse>(
      `/admin/v2/${location}/user/${ownerId}/info/owner`
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching owner details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyOwnerDetailsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch owner details";
    return emptyResponse;
  }
}

// ---------------------------------------------
// Profile API
// ---------------------------------------------

export interface UpdateOwnerProfileRequest {
  type: "profile";
  data: {
    firstname: string;
    lastname: string;
  };
}

export interface UpdateOwnerProfileResponse {
  success: boolean;
  message: string;
  data?: OwnerProfileResponse;
}

/**
 * Updates owner profile information
 */
export async function updateOwnerProfile(
  location: string,
  ownerId: number,
  profileData: {
    firstname: string;
    lastname: string;
  }
): Promise<UpdateOwnerProfileResponse | null> {
  try {
    const url = getOwnerInfoUrl(location, ownerId);
    const response = await apiClient.put<UpdateOwnerProfileResponse>(url, {
      type: "profile",
      data: profileData,
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error updating owner profile:", error);
    const apiError = error as { response?: { data?: UpdateOwnerProfileResponse }; message?: string };

    if (apiError.response?.data) {
      return apiError.response.data;
    }

    return {
      success: false,
      message: apiError.message || "Failed to update owner profile",
    };
  }
}

// ---------------------------------------------
// Email API
// ---------------------------------------------

export type CreateOwnerEmailRequest = OwnerInfoBaseRequest<
  "email",
  {
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type UpdateOwnerEmailRequest = OwnerInfoBaseRequest<
  "email",
  {
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type OwnerEmailApiResponse =
  OwnerInfoMutationResponse<OwnerEmailResponse>;

export async function addOwnerEmail(
  location: string,
  ownerId: number,
  emailData: CreateOwnerEmailRequest["data"]
): Promise<OwnerEmailApiResponse | null> {
  const requestBody: CreateOwnerEmailRequest = {
    type: "email",
    data: emailData,
  };

  return ownerInfoMutation<OwnerEmailResponse, CreateOwnerEmailRequest>(
    "post",
    location,
    ownerId,
    requestBody,
    "Failed to add email"
  );
}

export async function updateOwnerEmail(
  location: string,
  ownerId: number,
  id: number,
  emailData: Omit<UpdateOwnerEmailRequest["data"], "id">
): Promise<OwnerEmailApiResponse | null> {
  const requestBody: UpdateOwnerEmailRequest = {
    type: "email",
    data: {
      id,
      ...emailData,
    },
  };

  return ownerInfoMutation<OwnerEmailResponse, UpdateOwnerEmailRequest>(
    "put",
    location,
    ownerId,
    requestBody,
    "Failed to update email"
  );
}

export async function deleteOwnerEmail(
  location: string,
  ownerId: number,
  id: number | string
): Promise<OwnerEmailApiResponse | null> {
  const requestBody: OwnerInfoDeleteRequest<"email"> = {
    type: "email",
    id: String(id),
  };

  return ownerInfoMutation<OwnerEmailResponse, OwnerInfoDeleteRequest<"email">>(
    "delete",
    location,
    ownerId,
    requestBody,
    "Failed to delete email"
  );
}

// ---------------------------------------------
// Phone API
// ---------------------------------------------

export interface OwnerPhoneData {
  number: string;
  extension?: string | number;
  note?: string;
  label: string;
  isPrimary: boolean;
}

export type CreateOwnerPhoneRequest = OwnerInfoBaseRequest<
  "phone",
  OwnerPhoneData
>;

export type UpdateOwnerPhoneRequest = OwnerInfoBaseRequest<
  "phone",
  OwnerPhoneData & { id: number }
>;

export type OwnerPhoneApiResponse =
  OwnerInfoMutationResponse<OwnerPhoneResponse>;

/**
 * Normalizes phone data before sending to the API.
 * - Ensures extension is numeric if provided (matches admin behaviour).
 */
const normalizeOwnerPhoneData = (phoneData: OwnerPhoneData): OwnerPhoneData => {
  const { extension, ...rest } = phoneData;

  if (extension === undefined || extension === null) {
    return { ...rest };
  }

  const extString = extension.toString().trim();
  if (!extString) {
    return { ...rest };
  }

  // Only keep extension if it's all digits; otherwise drop it to avoid 500s
  if (/^\d+$/.test(extString)) {
    return { ...rest, extension: Number(extString) };
  }

  return { ...rest };
};

export async function addOwnerPhone(
  location: string,
  ownerId: number,
  phoneData: OwnerPhoneData
): Promise<OwnerPhoneApiResponse | null> {
  const normalized = normalizeOwnerPhoneData(phoneData);
  const requestBody: CreateOwnerPhoneRequest = {
    type: "phone",
    data: normalized,
  };

  return ownerInfoMutation<OwnerPhoneResponse, CreateOwnerPhoneRequest>(
    "post",
    location,
    ownerId,
    requestBody,
    "Failed to add phone"
  );
}

export async function updateOwnerPhone(
  location: string,
  ownerId: number,
  id: number,
  phoneData: OwnerPhoneData
): Promise<OwnerPhoneApiResponse | null> {
  const normalized = normalizeOwnerPhoneData(phoneData);
  const requestBody: UpdateOwnerPhoneRequest = {
    type: "phone",
    data: {
      id,
      ...normalized,
    },
  };

  return ownerInfoMutation<OwnerPhoneResponse, UpdateOwnerPhoneRequest>(
    "put",
    location,
    ownerId,
    requestBody,
    "Failed to update phone"
  );
}

export async function deleteOwnerPhone(
  location: string,
  ownerId: number,
  id: number | string
): Promise<OwnerPhoneApiResponse | null> {
  const requestBody: OwnerInfoDeleteRequest<"phone"> = {
    type: "phone",
    id: String(id),
  };

  return ownerInfoMutation<OwnerPhoneResponse, OwnerInfoDeleteRequest<"phone">>(
    "delete",
    location,
    ownerId,
    requestBody,
    "Failed to delete phone"
  );
}

// ---------------------------------------------
// Address API
// ---------------------------------------------

export interface OwnerAddressData {
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  label: string;
  isPrimary: boolean;
}

export type CreateOwnerAddressRequest = OwnerInfoBaseRequest<
  "addresses",
  OwnerAddressData
>;

export type UpdateOwnerAddressRequest = OwnerInfoBaseRequest<
  "addresses",
  OwnerAddressData & { id: number }
>;

export type OwnerAddressApiResponse =
  OwnerInfoMutationResponse<OwnerAddressResponse>;

export async function addOwnerAddress(
  location: string,
  ownerId: number,
  addressData: OwnerAddressData
): Promise<OwnerAddressApiResponse | null> {
  const requestBody: CreateOwnerAddressRequest = {
    type: "addresses",
    data: addressData,
  };

  return ownerInfoMutation<
    OwnerAddressResponse,
    CreateOwnerAddressRequest
  >(
    "post",
    location,
    ownerId,
    requestBody,
    "Failed to add address"
  );
}

export async function updateOwnerAddress(
  location: string,
  ownerId: number,
  id: number,
  addressData: OwnerAddressData
): Promise<OwnerAddressApiResponse | null> {
  const requestBody: UpdateOwnerAddressRequest = {
    type: "addresses",
    data: {
      id,
      ...addressData,
    },
  };

  return ownerInfoMutation<
    OwnerAddressResponse,
    UpdateOwnerAddressRequest
  >(
    "put",
    location,
    ownerId,
    requestBody,
    "Failed to update address"
  );
}

export async function deleteOwnerAddress(
  location: string,
  ownerId: number,
  id: number | string
): Promise<OwnerAddressApiResponse | null> {
  const requestBody: OwnerInfoDeleteRequest<"addresses"> = {
    type: "addresses",
    id: String(id),
  };

  return ownerInfoMutation<
    OwnerAddressResponse,
    OwnerInfoDeleteRequest<"addresses">
  >(
    "delete",
    location,
    ownerId,
    requestBody,
    "Failed to delete address"
  );
}

// ---------------------------------------------
// Email validation
// ---------------------------------------------

export interface ValidateOwnerEmailResponse {
  success: boolean;
  data: {
    exists: boolean;
  };
  message?: string;
}

/**
 * Validate if an email already exists for a user in the location
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function validateOwnerEmail(
  location: string,
  email: string
): Promise<ValidateOwnerEmailResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning

    // Mock validation - check if email exists in mock data
    let emailExists = false;
    for (const owner of mockOwnerData) {
      if (owner.email.toLowerCase() === email.toLowerCase()) {
        emailExists = true;
        break;
      }
      
      // Also check in detail emails if available
      const details = getCurrentMockData(owner.userId);
      if (details) {
        const found = details.email.some(
          (e) => e.email.toLowerCase() === email.toLowerCase()
        );
        if (found) {
          emailExists = true;
          break;
        }
      }
    }

    const mockResponse: ValidateOwnerEmailResponse = {
      success: true,
      data: {
        exists: emailExists,
      },
      message: emailExists 
        ? "Email already exists" 
        : "Email is available",
    };

    return mockResponse;
  } catch (error: unknown) {
    console.error("Error validating owner email:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      data: { exists: false },
      message:
        apiError.response?.data?.message || "Failed to validate owner email",
    };
  }
}

// ---------------------------------------------
// Set Password API (Mock)
// ---------------------------------------------

export interface SetOwnerPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface SetOwnerPasswordResponse {
  success: boolean;
  message?: string;
  data?: {
    status: string;
  };
}

/**
 * Sets password for an owner
 * Endpoint: POST /admin/v2/{location}/user/{ownerId}/set-password
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function setOwnerPassword(
  location: string,
  ownerId: number,
  data: SetOwnerPasswordRequest
): Promise<SetOwnerPasswordResponse> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    void location; // Suppress unused parameter warning

    // Validate password
    if (!data.password || data.password.trim() === "") {
      return {
        success: false,
        message: "Password is required",
      };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters",
      };
    }

    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match",
      };
    }

    // Check if owner exists in mock data
    const ownerExists = mockOwnerData.some((o) => o.userId === ownerId);
    if (!ownerExists) {
      return {
        success: false,
        message: "Owner not found",
      };
    }

    // Mock successful password update
    const mockResponse: SetOwnerPasswordResponse = {
      success: true,
      message: "Password updated successfully",
      data: {
        status: "updated",
      },
    };

    return mockResponse;

    // Uncomment when API is ready:
    // const url = `/admin/v2/${location}/user/${ownerId}/set-password`;
    // const response = await apiClient.post<SetOwnerPasswordResponse>(url, data);
    // return response.data;
  } catch (error: unknown) {
    console.error("Error setting owner password:", error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };

    return {
      success: false,
      message: apiError.response?.data?.message || apiError.message || "Failed to set password",
    };
  }
}

// ---------------------------------------------
// Delete Owner API (Mock)
// ---------------------------------------------

export interface DeleteOwnerResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    url: string;
    legacyUrl: string;
  };
}

/**
 * Deletes an owner
 * Endpoint: DELETE /admin/v2/{location}/user/{ownerId}/owner
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function deleteOwner(
  location: string,
  ownerId: number
): Promise<DeleteOwnerResponse> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    void location; // Suppress unused parameter warning

    // Check if owner exists in mock data
    const ownerExists = mockOwnerData.some((o) => o.userId === ownerId);
    if (!ownerExists) {
      return {
        success: false,
        message: "Owner not found",
        data: {
          id: ownerId,
          url: `/${location}/owners`,
          legacyUrl: "",
        },
      };
    }

    // Mock successful deletion
    const mockResponse: DeleteOwnerResponse = {
      success: true,
      message: "Owner deleted successfully",
      data: {
        id: ownerId,
        url: `/${location}/owners`,
        legacyUrl: "",
      },
    };

    return mockResponse;

    // Uncomment when API is ready:
    // const url = `/admin/v2/${location}/user/${ownerId}/owner`;
    // const response = await apiClient.delete<DeleteOwnerResponse>(url);
    // return response.data;
  } catch (error: unknown) {
    console.error("Error deleting owner:", error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };

    return {
      success: false,
      message: apiError.response?.data?.message || apiError.message || "Failed to delete owner",
      data: {
        id: ownerId,
        url: `/${location}/owners`,
        legacyUrl: "",
      },
    };
  }
}

