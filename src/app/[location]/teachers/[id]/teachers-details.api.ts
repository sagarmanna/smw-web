import { apiClient } from "@/lib/api/client";

// ---------------------------------------------
// Shared response types for teacher details
// ---------------------------------------------

export interface TeacherProfileResponse {
  name: string;
  role: string;
  status: string;
  birthDate: string;
  referralSource: string;
}

export interface TeacherEmailResponse {
  id: number;
  email: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherPhoneResponse {
  id: number;
  number: string;
  extension: string;
  note: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherAddressResponse {
  id: number;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  label: string;
  isPrimary: boolean;
}

export interface TeacherDetailsResponseBody {
  profile: TeacherProfileResponse;
  email: TeacherEmailResponse[];
  phone: TeacherPhoneResponse[];
  addresses: TeacherAddressResponse[];
}

export interface TeacherDetailsApiResponse {
  success: boolean;
  data: {
    body: TeacherDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Helper utilities (DRY)
// ---------------------------------------------

type TeacherInfoType = "email" | "phone" | "addresses";
type TeacherInfoMethod = "post" | "put" | "delete";

const getTeacherInfoUrl = (location: string, teacherId: number) =>
  `/admin/v2/${location}/user/${teacherId}/info/teacher`;

interface TeacherInfoBaseRequest<TType extends TeacherInfoType, TData> {
  type: TType;
  data: TData;
}

interface TeacherInfoDeleteRequest<TType extends TeacherInfoType> {
  type: TType;
  id: number | string;
}

export interface TeacherInfoMutationResponse<TItem> {
  success: boolean;
  message: string;
  data: TItem[];
}

const createTeacherInfoErrorResponse = <TItem>(
  defaultMessage: string,
  error: unknown
): TeacherInfoMutationResponse<TItem> => {
  const apiError = error as { response?: { data?: { message?: string } } };

  return {
    success: false,
    message: apiError.response?.data?.message || defaultMessage,
    data: [],
  };
};

async function teacherInfoMutation<TItem, TBody>(
  method: TeacherInfoMethod,
  location: string,
  teacherId: number,
  body: TBody,
  defaultErrorMessage: string
): Promise<TeacherInfoMutationResponse<TItem> | null> {
  try {
    const url = getTeacherInfoUrl(location, teacherId);

    // For DELETE requests, axios requires the body in config.data
    // For POST/PUT, axios accepts the body as the second parameter directly
    const response = await apiClient[method]<TeacherInfoMutationResponse<TItem>>(
      url,
      method === "delete" ? { data: body } : body
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Teacher info API error:", error);
    return createTeacherInfoErrorResponse<TItem>(defaultErrorMessage, error);
  }
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed teacher information from the API
 * Endpoint: GET /admin/v2/{location}/user/{id}/info/teacher
 *
 * @param location - The location identifier
 * @param teacherId - The teacher user ID
 * @returns Promise resolving to the teacher details response or null on error
 */
export async function getTeacherDetails(
  location: string,
  teacherId: number
): Promise<TeacherDetailsApiResponse | null> {
  try {
    const response = await apiClient.get<TeacherDetailsApiResponse>(
      getTeacherInfoUrl(location, teacherId)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    return null;
  }
}

// Teacher Qualification Response Types
export interface TeacherQualificationResponse {
  id: number;
  programId: number;
  programName: string;
  rate: string; // API returns formatted string like "$25.00"
  type: number; // 1 for private, likely 2 for group
}

export interface TeacherQualificationsApiResponse {
  success: boolean;
  data: {
    body: TeacherQualificationResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/**
 * Fetches teacher qualifications from the API
 * Endpoint: GET /admin/v2/{location}/teachers/{teacherId}/qualifications?type={type}
 * 
 * @param location - The location identifier
 * @param teacherId - The teacher user ID
 * @param type - The qualification type: "private" or "group"
 * @returns Promise resolving to the qualifications response or null on error
 */
export async function getTeacherQualifications(
  location: string,
  teacherId: number,
  type: "private" | "group"
): Promise<TeacherQualificationsApiResponse | null> {
  try {
    const response = await apiClient.get<TeacherQualificationsApiResponse>(
      `/admin/v2/${location}/teachers/${teacherId}/qualifications`,
      {
        params: {
          type: type,
          limit: 999,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher qualifications:', error);
    return null;
  }
}

// ---------------------------------------------
// Profile API
// ---------------------------------------------

export interface UpdateTeacherProfileRequest {
  // NOTE: API expects singular "profile" (not "profiles")
  type: "profile";
  data: {
    firstname: string;
    lastname: string;
    birthDate?: string;
  };
}

export interface UpdateTeacherProfileResponse {
  success: boolean;
  message: string;
  data?: TeacherProfileResponse;
}

/**
 * Updates teacher profile information
 * Endpoint: PUT /admin/v2/{location}/user/{teacherId}/info/teacher
 * Body: { "type": "profile", "data": { "firstname": "...", "lastname": "...", "birthDate": "..." } }
 */
export async function updateTeacherProfile(
  location: string,
  teacherId: number,
  profileData: {
    firstname: string;
    lastname: string;
    birthDate?: string;
  }
): Promise<UpdateTeacherProfileResponse | null> {
  try {
    const requestBody: UpdateTeacherProfileRequest = {
      type: "profile",
      data: {
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        ...(profileData.birthDate && { birthDate: profileData.birthDate }),
      },
    };

    const url = getTeacherInfoUrl(location, teacherId);
    const response = await apiClient.put<UpdateTeacherProfileResponse>(
      url,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error updating teacher profile:", error);
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update teacher profile",
    };
  }
}

// ---------------------------------------------
// Email API
// ---------------------------------------------

export type CreateTeacherEmailRequest = TeacherInfoBaseRequest<
  "email",
  {
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type UpdateTeacherEmailRequest = TeacherInfoBaseRequest<
  "email",
  {
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }
>;

export type TeacherEmailApiResponse =
  TeacherInfoMutationResponse<TeacherEmailResponse>;

export interface ValidateTeacherEmailResponse {
  success: boolean;
  data: {
    exists: boolean;
  };
  message?: string;
}

/**
 * Adds a new email for a teacher
 * Endpoint: POST /admin/v2/{location}/user/{teacherId}/info/teacher
 */
export async function addTeacherEmail(
  location: string,
  teacherId: number,
  emailData: CreateTeacherEmailRequest["data"]
): Promise<TeacherEmailApiResponse | null> {
  const requestBody: CreateTeacherEmailRequest = {
    type: "email",
    data: emailData,
  };

  return teacherInfoMutation<TeacherEmailResponse, CreateTeacherEmailRequest>(
    "post",
    location,
    teacherId,
    requestBody,
    "Failed to add email"
  );
}

/**
 * Updates an existing email for a teacher
 * Endpoint: PUT /admin/v2/{location}/user/{teacherId}/info/teacher
 */
export async function updateTeacherEmail(
  location: string,
  teacherId: number,
  id: number,
  emailData: Omit<UpdateTeacherEmailRequest["data"], "id">
): Promise<TeacherEmailApiResponse | null> {
  const requestBody: UpdateTeacherEmailRequest = {
    type: "email",
    data: {
      id,
      ...emailData,
    },
  };

  return teacherInfoMutation<TeacherEmailResponse, UpdateTeacherEmailRequest>(
    "put",
    location,
    teacherId,
    requestBody,
    "Failed to update email"
  );
}

/**
 * Deletes an email for a teacher
 * Endpoint: DELETE /admin/v2/{location}/user/{teacherId}/info/teacher
 * Body: { "type": "email", "id": "<emailId>" }
 */
export async function deleteTeacherEmail(
  location: string,
  teacherId: number,
  id: number | string
): Promise<TeacherEmailApiResponse | null> {
  const requestBody: TeacherInfoDeleteRequest<"email"> = {
    type: "email",
    id: String(id), // Ensure id is always a string
  };

  return teacherInfoMutation<TeacherEmailResponse, TeacherInfoDeleteRequest<"email">>(
    "delete",
    location,
    teacherId,
    requestBody,
    "Failed to delete email"
  );
}

// ---------------------------------------------
// Phone API
// ---------------------------------------------

export interface TeacherPhoneData {
  number: string;
  extension?: string | number;
  note?: string;
  label: string;
  isPrimary: boolean;
}

export type CreateTeacherPhoneRequest = TeacherInfoBaseRequest<
  "phone",
  TeacherPhoneData
>;

export type UpdateTeacherPhoneRequest = TeacherInfoBaseRequest<
  "phone",
  TeacherPhoneData & { id: number }
>;

export type TeacherPhoneApiResponse =
  TeacherInfoMutationResponse<TeacherPhoneResponse>;

export async function addTeacherPhone(
  location: string,
  teacherId: number,
  phoneData: TeacherPhoneData
): Promise<TeacherPhoneApiResponse | null> {
  const requestBody: CreateTeacherPhoneRequest = {
    type: "phone",
    data: phoneData,
  };

  return teacherInfoMutation<TeacherPhoneResponse, CreateTeacherPhoneRequest>(
    "post",
    location,
    teacherId,
    requestBody,
    "Failed to add phone"
  );
}

export async function updateTeacherPhone(
  location: string,
  teacherId: number,
  id: number,
  phoneData: TeacherPhoneData
): Promise<TeacherPhoneApiResponse | null> {
  const requestBody: UpdateTeacherPhoneRequest = {
    type: "phone",
    data: {
      id,
      ...phoneData,
    },
  };

  return teacherInfoMutation<TeacherPhoneResponse, UpdateTeacherPhoneRequest>(
    "put",
    location,
    teacherId,
    requestBody,
    "Failed to update phone"
  );
}

export async function deleteTeacherPhone(
  location: string,
  teacherId: number,
  id: number | string
): Promise<TeacherPhoneApiResponse | null> {
  const requestBody: TeacherInfoDeleteRequest<"phone"> = {
    type: "phone",
    id: String(id), // Ensure id is always a string
  };

  return teacherInfoMutation<TeacherPhoneResponse, TeacherInfoDeleteRequest<"phone">>(
    "delete",
    location,
    teacherId,
    requestBody,
    "Failed to delete phone"
  );
}

// ---------------------------------------------
// Address API
// ---------------------------------------------

export interface TeacherAddressData {
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  label: string;
  isPrimary: boolean;
}

export type CreateTeacherAddressRequest = TeacherInfoBaseRequest<
  "addresses",
  TeacherAddressData
>;

export type UpdateTeacherAddressRequest = TeacherInfoBaseRequest<
  "addresses",
  TeacherAddressData & { id: number }
>;

export type TeacherAddressApiResponse =
  TeacherInfoMutationResponse<TeacherAddressResponse>;

export async function addTeacherAddress(
  location: string,
  teacherId: number,
  addressData: TeacherAddressData
): Promise<TeacherAddressApiResponse | null> {
  const requestBody: CreateTeacherAddressRequest = {
    type: "addresses",
    data: addressData,
  };

  return teacherInfoMutation<
    TeacherAddressResponse,
    CreateTeacherAddressRequest
  >("post", location, teacherId, requestBody, "Failed to add address");
}

export async function updateTeacherAddress(
  location: string,
  teacherId: number,
  id: number,
  addressData: TeacherAddressData
): Promise<TeacherAddressApiResponse | null> {
  const requestBody: UpdateTeacherAddressRequest = {
    type: "addresses",
    data: {
      id,
      ...addressData,
    },
  };

  return teacherInfoMutation<
    TeacherAddressResponse,
    UpdateTeacherAddressRequest
  >("put", location, teacherId, requestBody, "Failed to update address");
}

export async function deleteTeacherAddress(
  location: string,
  teacherId: number,
  id: number | string
): Promise<TeacherAddressApiResponse | null> {
  const requestBody: TeacherInfoDeleteRequest<"addresses"> = {
    type: "addresses",
    id: String(id), // Ensure id is always a string
  };

  return teacherInfoMutation<
    TeacherAddressResponse,
    TeacherInfoDeleteRequest<"addresses">
  >("delete", location, teacherId, requestBody, "Failed to delete address");
}

// ---------------------------------------------
// Email validation (shared with customers)
// ---------------------------------------------

export interface ValidateTeacherEmailResponse {
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
export async function validateTeacherEmail(
  location: string,
  email: string
): Promise<ValidateTeacherEmailResponse | null> {
  try {
    const response = await apiClient.get<ValidateTeacherEmailResponse>(
      `/admin/v2/${location}/user/validate-email?email=${encodeURIComponent(
        email
      )}`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      data: { exists: false },
      message:
        apiError.response?.data?.message || "Failed to validate teacher email",
    };
  }
}