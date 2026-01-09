// import { apiClient } from "@/lib/api/client"; // Uncomment when API is ready

import { mockStaffMemberData } from "../mockData/staffMemberMockData";

// ---------------------------------------------
// Shared response types for staff member details
// ---------------------------------------------

export interface StaffMemberProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
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
// Helper utilities (DRY)
// ---------------------------------------------

type StaffMemberInfoType = "email" | "phone" | "addresses";
type StaffMemberInfoMethod = "post" | "put" | "delete";

// Helper function for future API implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStaffMemberInfoUrl = (location: string, staffMemberId: number) =>
  `/admin/v2/${location}/user/${staffMemberId}/info/staffmember`;

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

// ---------------------------------------------
// Mock Data Store (in-memory for session persistence)
// ---------------------------------------------

// In-memory store to persist mock data changes during the session
const mockDataStore: Map<number, StaffMemberDetailsResponseBody> = new Map();

/**
 * Initialize mock data for a staff member if not already in store
 */
function initializeMockData(staffMemberId: number): StaffMemberDetailsResponseBody | null {
  if (mockDataStore.has(staffMemberId)) {
    return mockDataStore.get(staffMemberId)!;
  }

  // Find the staff member in the listing mock data
  const staffMember = mockStaffMemberData.find((s) => s.userId === staffMemberId);

  if (!staffMember) {
    return null;
  }

  // Generate mock detail data based on the staff member
  const fullName = `${staffMember.firstName} ${staffMember.lastName}`.trim();

  const mockData: StaffMemberDetailsResponseBody = {
    profile: {
      name: fullName,
      role: "Staff Member",
      status: staffMember.isActive ? "Active" : "Inactive",
      birthDate: staffMemberId === 1 ? "1990-01-15" : "",
    },
    email: [
      {
        id: staffMemberId * 100 + 1,
        email: staffMember.email,
        note: "",
        label: "Work",
        isPrimary: true,
      },
    ],
    phone: staffMemberId === 1
      ? [
          {
            id: staffMemberId * 100 + 1,
            number: "(416) 555-1234",
            extension: "",
            note: "",
            label: "Work",
            isPrimary: false,
          },
        ]
      : [],
    addresses: staffMemberId === 1
      ? [
          {
            id: staffMemberId * 100 + 1,
            address: "123 Main Street",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            postalCode: "M5H 2N2",
            label: "Work",
            isPrimary: false,
          },
        ]
      : [],
  };

  mockDataStore.set(staffMemberId, mockData);
  return mockData;
}

/**
 * Get current mock data for mutations
 */
function getCurrentMockData(staffMemberId: number): StaffMemberDetailsResponseBody | null {
  return initializeMockData(staffMemberId);
}

/**
 * Update mock data in the store (for mutations)
 */
function updateMockStaffMemberData(
  staffMemberId: number,
  updates: Partial<StaffMemberDetailsResponseBody>
): void {
  const currentData = initializeMockData(staffMemberId);
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

  mockDataStore.set(staffMemberId, currentData);
}

async function staffMemberInfoMutation<TItem, TBody>(
  method: StaffMemberInfoMethod,
  location: string,
  staffMemberId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<StaffMemberInfoMutationResponse<TItem> | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get current mock data
    const currentData = getCurrentMockData(staffMemberId);

    if (!currentData) {
      return {
        success: false,
        message: "Staff member not found",
        data: [] as TItem[],
      };
    }

    // Build mock response based on the type of mutation
    const bodyData = (body as { data?: unknown }).data;
    let updatedData: TItem[] = [];

    if (method === "delete") {
      const deleteBody = body as StaffMemberInfoDeleteRequest<StaffMemberInfoType>;
      const deleteId = typeof deleteBody.id === "string" ? parseInt(deleteBody.id) : deleteBody.id;
      
      if (deleteBody.type === "email") {
        const updatedEmails = currentData.email.filter((e) => e.id !== deleteId);
        updateMockStaffMemberData(staffMemberId, { email: updatedEmails });
        updatedData = updatedEmails.map((e) => ({ ...e } as TItem));
      } else if (deleteBody.type === "phone") {
        const updatedPhones = currentData.phone.filter((p) => p.id !== deleteId);
        updateMockStaffMemberData(staffMemberId, { phone: updatedPhones });
        updatedData = updatedPhones.map((p) => ({ ...p } as TItem));
      } else if (deleteBody.type === "addresses") {
        const updatedAddresses = currentData.addresses.filter((a) => a.id !== deleteId);
        updateMockStaffMemberData(staffMemberId, { addresses: updatedAddresses });
        updatedData = updatedAddresses.map((a) => ({ ...a } as TItem));
      }
    } else if (method === "post") {
      // Add new item
      const newId = Date.now(); // Generate a unique ID
      if ((body as { type?: string }).type === "email" && bodyData) {
        const emailData = bodyData as { email: string; label: string; note?: string; isPrimary: boolean };
        const newEmail: StaffMemberEmailResponse = {
          id: newId,
          email: emailData.email,
          note: emailData.note || "",
          label: emailData.label,
          isPrimary: emailData.isPrimary,
        };
        const updatedEmails = emailData.isPrimary 
          ? currentData.email.map(e => ({ ...e, isPrimary: false })).concat(newEmail)
          : currentData.email.concat(newEmail);
        updateMockStaffMemberData(staffMemberId, { email: updatedEmails });
        updatedData = updatedEmails.map((e) => ({ ...e } as TItem));
      } else if ((body as { type?: string }).type === "phone" && bodyData) {
        const phoneData = bodyData as { number: string; extension?: string | number; label: string; note?: string; isPrimary: boolean };
        const newPhone: StaffMemberPhoneResponse = {
          id: newId,
          number: phoneData.number,
          extension: typeof phoneData.extension === "number" ? phoneData.extension.toString() : (phoneData.extension || ""),
          note: phoneData.note || "",
          label: phoneData.label,
          isPrimary: phoneData.isPrimary || false,
        };
        const updatedPhones = currentData.phone.concat(newPhone);
        updateMockStaffMemberData(staffMemberId, { phone: updatedPhones });
        updatedData = updatedPhones.map((p) => ({ ...p } as TItem));
      } else if ((body as { type?: string }).type === "addresses" && bodyData) {
        const addressData = bodyData as { address: string; city: string; postalCode: string; label: string; isPrimary: boolean };
        const newAddress: StaffMemberAddressResponse = {
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
        updateMockStaffMemberData(staffMemberId, { addresses: updatedAddresses });
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
        updateMockStaffMemberData(staffMemberId, { email: updatedEmails });
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
        updateMockStaffMemberData(staffMemberId, { phone: updatedPhones });
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
        updateMockStaffMemberData(staffMemberId, { addresses: updatedAddresses });
        updatedData = updatedAddresses.map((a) => ({ ...a } as TItem));
      }
    }

    const mockResponse: StaffMemberInfoMutationResponse<TItem> = {
      success: true,
      message: method === "delete" 
        ? "Item deleted successfully" 
        : method === "post" 
        ? "Item added successfully" 
        : "Item updated successfully",
      data: updatedData,
    };

    return mockResponse;
  } catch (error: unknown) {
    console.error("Staff member info API error:", error);
    return createStaffMemberInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed staff member information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/staffmember
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function getStaffMemberDetails(
  location: string,
  staffMemberId: number
): Promise<StaffMemberDetailsApiResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    void location; // Suppress unused parameter warning

    // Get mock data from in-memory store
    const mockData = initializeMockData(staffMemberId);
    
    if (!mockData) {
      // Fallback if staff member not found in mock data
      console.warn(`Staff member ${staffMemberId} not found in mock data`);
      return {
        success: false,
        message: "Staff member not found",
        data: {
          body: {
            profile: {
              name: "",
              role: "Staff Member",
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
      message: "Staff member details fetched successfully",
      data: {
        body: mockData,
      },
    };
  } catch (error) {
    console.error("Error fetching staff member details:", error);
    // Return error response instead of null
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch staff member details",
      data: {
        body: {
          profile: {
            name: "",
            role: "Staff Member",
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

export interface UpdateStaffMemberProfileRequest {
  type: "profile";
  data: {
    firstname: string;
    lastname: string;
  };
}

export interface UpdateStaffMemberProfileResponse {
  success: boolean;
  message: string;
  data?: StaffMemberProfileResponse;
}

/**
 * Updates staff member profile information
 */
export async function updateStaffMemberProfile(
  location: string,
  staffMemberId: number,
  profileData: {
    firstname: string;
    lastname: string;
  }
): Promise<UpdateStaffMemberProfileResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock success response
    const mockResponse: UpdateStaffMemberProfileResponse = {
      success: true,
      message: "Staff member profile updated successfully",
      data: {
        name: `${profileData.firstname} ${profileData.lastname}`.trim(),
        role: "Staff Member",
        status: "Active",
        birthDate: "",
      },
    };

    return mockResponse;
  } catch (error: unknown) {
    console.error("Error updating staff member profile:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update staff member profile",
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

  return staffMemberInfoMutation<StaffMemberEmailResponse, CreateStaffMemberEmailRequest>(
    "post",
    location,
    staffMemberId,
    requestBody,
    "Failed to add email"
  );
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

  return staffMemberInfoMutation<StaffMemberEmailResponse, UpdateStaffMemberEmailRequest>(
    "put",
    location,
    staffMemberId,
    requestBody,
    "Failed to update email"
  );
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

  return staffMemberInfoMutation<StaffMemberEmailResponse, StaffMemberInfoDeleteRequest<"email">>(
    "delete",
    location,
    staffMemberId,
    requestBody,
    "Failed to delete email"
  );
}

// ---------------------------------------------
// Phone API
// ---------------------------------------------

export interface StaffMemberPhoneData {
  number: string;
  extension?: string | number;
  note?: string;
  label: string;
  isPrimary: boolean;
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

  return staffMemberInfoMutation<StaffMemberPhoneResponse, CreateStaffMemberPhoneRequest>(
    "post",
    location,
    staffMemberId,
    requestBody,
    "Failed to add phone"
  );
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

  return staffMemberInfoMutation<StaffMemberPhoneResponse, UpdateStaffMemberPhoneRequest>(
    "put",
    location,
    staffMemberId,
    requestBody,
    "Failed to update phone"
  );
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

  return staffMemberInfoMutation<StaffMemberPhoneResponse, StaffMemberInfoDeleteRequest<"phone">>(
    "delete",
    location,
    staffMemberId,
    requestBody,
    "Failed to delete phone"
  );
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
  >(
    "post",
    location,
    staffMemberId,
    requestBody,
    "Failed to add address"
  );
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
  >(
    "put",
    location,
    staffMemberId,
    requestBody,
    "Failed to update address"
  );
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
  >(
    "delete",
    location,
    staffMemberId,
    requestBody,
    "Failed to delete address"
  );
}

// ---------------------------------------------
// Email validation
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
 * Currently using mock data - will be replaced with actual API call when backend is ready
 */
export async function validateStaffMemberEmail(
  location: string,
  email: string
): Promise<ValidateStaffMemberEmailResponse | null> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    void location; // Suppress unused parameter warning

    // Mock validation - check if email exists in mock data
    let emailExists = false;
    for (const staffMember of mockStaffMemberData) {
      if (staffMember.email.toLowerCase() === email.toLowerCase()) {
        emailExists = true;
        break;
      }
      
      // Also check in detail emails if available
      const details = getCurrentMockData(staffMember.userId);
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

    const mockResponse: ValidateStaffMemberEmailResponse = {
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
    console.error("Error validating staff member email:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      data: { exists: false },
      message:
        apiError.response?.data?.message || "Failed to validate staff member email",
    };
  }
}

