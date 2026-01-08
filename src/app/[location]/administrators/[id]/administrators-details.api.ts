// import { apiClient } from "@/lib/api/client"; // Uncomment when API is ready

// ---------------------------------------------
// Shared response types for administrator details
// ---------------------------------------------

export interface AdministratorProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
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
// Helper utilities (DRY)
// ---------------------------------------------

type AdministratorInfoType = "email" | "phone" | "addresses";
type AdministratorInfoMethod = "post" | "put" | "delete";

// Helper function for future API implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// ---------------------------------------------
// Mock Data Store (in-memory for session persistence)
// ---------------------------------------------

// In-memory store to persist mock data changes during the session
const mockDataStore: Map<number, AdministratorDetailsResponseBody> = new Map();

/**
 * Initialize mock data for an administrator if not already in store
 */
function initializeMockData(administratorId: number): AdministratorDetailsResponseBody | null {
  if (mockDataStore.has(administratorId)) {
    return mockDataStore.get(administratorId)!;
  }

  // Initialize with default mock data structure for detail page
  // When detail API is integrated, this will be replaced with real API call
  // Listing now uses real API, so no dependency on listing mock data
  const mockData: AdministratorDetailsResponseBody = {
    profile: {
      name: "Administrator",
      role: "Administrator",
      status: "Active",
      birthDate: "",
    },
    email: [],
    phone: [],
    addresses: [],
  };

  mockDataStore.set(administratorId, mockData);
  return mockData;
}

/**
 * Get current mock data for mutations
 */
function getCurrentMockData(administratorId: number): AdministratorDetailsResponseBody | null {
  return initializeMockData(administratorId);
}

/**
 * Update mock data in the store (for mutations)
 */
function updateMockAdministratorData(
  administratorId: number,
  updates: Partial<AdministratorDetailsResponseBody>
): void {
  const currentData = initializeMockData(administratorId);
  if (!currentData) return;

  if (updates.profile) {
    currentData.profile = { ...currentData.profile, ...updates.profile };
  }
  if (updates.email) {
    currentData.email = updates.email;
  }
  if (updates.phone) {
    currentData.phone = updates.phone;
  }
  if (updates.addresses) {
    currentData.addresses = updates.addresses;
  }

  mockDataStore.set(administratorId, currentData);
}

async function administratorInfoMutation<TItem, TBody>(
  method: AdministratorInfoMethod,
  location: string,
  administratorId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<AdministratorInfoMutationResponse<TItem> | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get current mock data
    const currentData = getCurrentMockData(administratorId);

    if (!currentData) {
      return {
        success: false,
        message: "Administrator not found",
        data: [] as TItem[],
      };
    }

    // Build mock response based on the type of mutation
    const bodyData = (body as { data?: unknown }).data;
    let updatedData: TItem[] = [];

    if (method === "delete") {
      const deleteBody = body as AdministratorInfoDeleteRequest<AdministratorInfoType>;
      const deleteId = typeof deleteBody.id === "string" ? parseInt(deleteBody.id) : deleteBody.id;
      
      if (deleteBody.type === "email") {
        const updatedEmails = currentData.email.filter((e) => e.id !== deleteId);
        updateMockAdministratorData(administratorId, { email: updatedEmails });
        updatedData = updatedEmails.map((e) => ({ ...e } as TItem));
      } else if (deleteBody.type === "phone") {
        const updatedPhones = currentData.phone.filter((p) => p.id !== deleteId);
        updateMockAdministratorData(administratorId, { phone: updatedPhones });
        updatedData = updatedPhones.map((p) => ({ ...p } as TItem));
      } else if (deleteBody.type === "addresses") {
        const updatedAddresses = currentData.addresses.filter((a) => a.id !== deleteId);
        updateMockAdministratorData(administratorId, { addresses: updatedAddresses });
        updatedData = updatedAddresses.map((a) => ({ ...a } as TItem));
      }
    } else if (method === "post") {
      // Add new item
      const newId = Date.now(); // Generate a unique ID
      if ((body as { type?: string }).type === "email" && bodyData) {
        const emailData = bodyData as { email: string; label: string; note?: string; isPrimary: boolean };
        const newEmail: AdministratorEmailResponse = {
          id: newId,
          email: emailData.email,
          note: emailData.note || "",
          label: emailData.label,
          isPrimary: emailData.isPrimary,
        };
        const updatedEmails = emailData.isPrimary 
          ? currentData.email.map(e => ({ ...e, isPrimary: false })).concat(newEmail)
          : currentData.email.concat(newEmail);
        updateMockAdministratorData(administratorId, { email: updatedEmails });
        updatedData = updatedEmails.map((e) => ({ ...e } as TItem));
      } else if ((body as { type?: string }).type === "phone" && bodyData) {
        const phoneData = bodyData as { number: string; extension?: string | number; label: string; note?: string; isPrimary: boolean };
        const newPhone: AdministratorPhoneResponse = {
          id: newId,
          number: phoneData.number,
          extension: typeof phoneData.extension === "number" ? phoneData.extension.toString() : (phoneData.extension || ""),
          note: phoneData.note || "",
          label: phoneData.label,
          isPrimary: phoneData.isPrimary || false,
        };
        const updatedPhones = currentData.phone.concat(newPhone);
        updateMockAdministratorData(administratorId, { phone: updatedPhones });
        updatedData = updatedPhones.map((p) => ({ ...p } as TItem));
      } else if ((body as { type?: string }).type === "addresses" && bodyData) {
        const addressData = bodyData as { address: string; city: string; postalCode: string; label: string; isPrimary: boolean };
        const newAddress: AdministratorAddressResponse = {
          id: newId,
          address: addressData.address,
          city: addressData.city,
          province: "Ontario",
          country: "Canada",
          postalCode: addressData.postalCode,
          label: addressData.label,
          isPrimary: addressData.isPrimary || false,
        };
        const updatedAddresses = currentData.addresses.concat(newAddress);
        updateMockAdministratorData(administratorId, { addresses: updatedAddresses });
        updatedData = updatedAddresses.map((a) => ({ ...a } as TItem));
      }
    } else if (method === "put") {
      // Update existing item
      const updateBody = body as { type?: string; data?: { id?: number } };
      const updateId = updateBody.data?.id;
      
      if (updateBody.type === "email" && bodyData) {
        const emailData = bodyData as { email: string; label: string; note?: string; isPrimary: boolean };
        const updatedEmails = emailData.isPrimary
          ? currentData.email.map((e) => 
              e.id === updateId 
                ? { ...e, email: emailData.email, label: emailData.label, note: emailData.note || "", isPrimary: true }
                : { ...e, isPrimary: false }
            )
          : currentData.email.map((e) => 
              e.id === updateId 
                ? { ...e, email: emailData.email, label: emailData.label, note: emailData.note || "", isPrimary: emailData.isPrimary }
                : e
            );
        updateMockAdministratorData(administratorId, { email: updatedEmails });
        updatedData = updatedEmails.map((e) => ({ ...e } as TItem));
      } else if (updateBody.type === "phone" && bodyData) {
        const phoneData = bodyData as { number: string; extension?: string | number; label: string; note?: string; isPrimary: boolean };
        const updatedPhones = currentData.phone.map((p) => 
          p.id === updateId 
            ? { 
                ...p, 
                number: phoneData.number, 
                extension: typeof phoneData.extension === "number" ? phoneData.extension.toString() : (phoneData.extension || ""), 
                label: phoneData.label, 
                note: phoneData.note || "", 
                isPrimary: phoneData.isPrimary || false 
              }
            : p
        );
        updateMockAdministratorData(administratorId, { phone: updatedPhones });
        updatedData = updatedPhones.map((p) => ({ ...p } as TItem));
      } else if (updateBody.type === "addresses" && bodyData) {
        const addressData = bodyData as { address: string; city: string; postalCode: string; label: string; isPrimary: boolean };
        const updatedAddresses = currentData.addresses.map((a) => 
          a.id === updateId 
            ? { 
                ...a, 
                address: addressData.address, 
                city: addressData.city, 
                postalCode: addressData.postalCode, 
                label: addressData.label, 
                isPrimary: addressData.isPrimary || false 
              }
            : a
        );
        updateMockAdministratorData(administratorId, { addresses: updatedAddresses });
        updatedData = updatedAddresses.map((a) => ({ ...a } as TItem));
      }
    }

    const mockResponse: AdministratorInfoMutationResponse<TItem> = {
      success: true,
      message: method === "delete" 
        ? "Item deleted successfully" 
        : method === "post" 
        ? "Item added successfully" 
        : "Item updated successfully",
      data: updatedData,
    };

    return mockResponse;

    // Uncomment when API is ready:
    // const url = getAdministratorInfoUrl(location, administratorId);
    // const response = await apiClient[method]<AdministratorInfoMutationResponse<TItem>>(
    //   url,
    //   method === "delete" ? { data: body } : body
    // );
    // return response.data;
  } catch (error: unknown) {
    console.error("Administrator info API error:", error);
    return createAdministratorInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed administrator information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/administrator
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function getAdministratorDetails(
  location: string,
  administratorId: number
): Promise<AdministratorDetailsApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    void location; // Suppress unused parameter warning

    // Get mock data from in-memory store
    const mockData = initializeMockData(administratorId);
    
    if (!mockData) {
      // Fallback if administrator not found in mock data
      console.warn(`Administrator ${administratorId} not found in mock data`);
      return {
        success: false,
        message: "Administrator not found",
        data: {
          body: {
            profile: {
              name: "",
              role: "Administrator",
              status: "Inactive",
              birthDate: "",
            },
            email: [],
            phone: [],
            addresses: [],
          },
        },
      };
    }

    return {
      success: true,
      message: "Administrator details fetched successfully",
      data: {
        body: mockData,
      },
    };

    // Uncomment when API is ready:
    // const response = await apiClient.get<AdministratorDetailsApiResponse>(
    //   getAdministratorInfoUrl(location, administratorId)
    // );
    // return response.data;
  } catch (error) {
    console.error("Error fetching administrator details:", error);
    // Return error response instead of null
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch administrator details",
      data: {
        body: {
          profile: {
            name: "",
            role: "Administrator",
            status: "Inactive",
            birthDate: "",
          },
          email: [],
          phone: [],
          addresses: [],
        },
      },
    };
  }
}

// ---------------------------------------------
// Profile API
// ---------------------------------------------

export interface UpdateAdministratorProfileRequest {
  type: "profile";
  data: {
    firstname: string;
    lastname: string;
  };
}

export interface UpdateAdministratorProfileResponse {
  success: boolean;
  message: string;
  data?: AdministratorProfileResponse;
}

/**
 * Updates administrator profile information
 */
export async function updateAdministratorProfile(
  location: string,
  administratorId: number,
  profileData: {
    firstname: string;
    lastname: string;
  }
): Promise<UpdateAdministratorProfileResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock success response
    const mockResponse: UpdateAdministratorProfileResponse = {
      success: true,
      message: "Administrator profile updated successfully",
      data: {
        name: `${profileData.firstname} ${profileData.lastname}`.trim(),
        role: "Administrator",
        status: "Active",
        birthDate: "",
      },
    };

    return mockResponse;

    // Uncomment when API is ready:
    // const requestBody: UpdateAdministratorProfileRequest = {
    //   type: "profile",
    //   data: {
    //     firstname: profileData.firstname,
    //     lastname: profileData.lastname,
    //   },
    // };
    // const url = getAdministratorInfoUrl(location, administratorId);
    // const response = await apiClient.put<UpdateAdministratorProfileResponse>(
    //   url,
    //   requestBody
    // );
    // return response.data;
  } catch (error: unknown) {
    console.error("Error updating administrator profile:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update administrator profile",
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

export async function deleteAdministratorEmail(
  location: string,
  administratorId: number,
  id: number | string
): Promise<AdministratorEmailApiResponse | null> {
  const requestBody: AdministratorInfoDeleteRequest<"email"> = {
    type: "email",
    id: String(id),
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
  isPrimary: boolean;
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
    id: String(id),
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
  >(
    "post",
    location,
    administratorId,
    requestBody,
    "Failed to add address"
  );
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
  >(
    "put",
    location,
    administratorId,
    requestBody,
    "Failed to update address"
  );
}

export async function deleteAdministratorAddress(
  location: string,
  administratorId: number,
  id: number | string
): Promise<AdministratorAddressApiResponse | null> {
  const requestBody: AdministratorInfoDeleteRequest<"addresses"> = {
    type: "addresses",
    id: String(id),
  };

  return administratorInfoMutation<
    AdministratorAddressResponse,
    AdministratorInfoDeleteRequest<"addresses">
  >(
    "delete",
    location,
    administratorId,
    requestBody,
    "Failed to delete address"
  );
}

// ---------------------------------------------
// Email validation
// ---------------------------------------------

export interface ValidateAdministratorEmailResponse {
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
export async function validateAdministratorEmail(
  location: string,
  email: string
): Promise<ValidateAdministratorEmailResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning

    // Mock validation - check if email exists in detail mock data
    // Listing now uses real API, so we only check detail page mock data
    let emailExists = false;
    
    // Check all stored detail mock data for email conflicts
    mockDataStore.forEach((details) => {
      const found = details.email.some(
        (e) => e.email.toLowerCase() === email.toLowerCase()
      );
      if (found) {
        emailExists = true;
      }
    });

    const mockResponse: ValidateAdministratorEmailResponse = {
      success: true,
      data: {
        exists: emailExists,
      },
      message: emailExists 
        ? "Email already exists" 
        : "Email is available",
    };

    return mockResponse;

    // Uncomment when API is ready:
    // const response = await apiClient.get<ValidateAdministratorEmailResponse>(
    //   `/admin/v2/${location}/user/validate-email?email=${encodeURIComponent(
    //     email
    //   )}`
    // );
    // return response.data;
  } catch (error: unknown) {
    console.error("Error validating administrator email:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      data: { exists: false },
      message:
        apiError.response?.data?.message || "Failed to validate administrator email",
    };
  }
}

