import { apiClient } from "@/lib/api/client";

export interface EmailData {
  id: number;
  email: string;
  note?: string;
  label: string;
  isPrimary: boolean;
}

export interface CreateEmailRequest {
  type: "email";
  data: {
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface UpdateEmailRequest {
  type: "email";
  data: {
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  };
}

export interface DeleteEmailRequest {
  type: "email";
  id: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  data: EmailData[];
}

export interface DeleteEmailResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    deleted: boolean;
  };
  message: string;
}

export interface ValidateEmailResponse {
  success: boolean;
  data: {
    exists: boolean;
  };
  message?: string;
}

/**
 * Validate if an email already exists for a customer in the location
 * @param location - The location identifier
 * @param email - The email to validate
 * @returns Promise with validation result
 */
export async function validateCustomerEmail(
  location: string,
  email: string
): Promise<ValidateEmailResponse | null> {
  try {
    const response = await apiClient.get<ValidateEmailResponse>(
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

/**
 * Create a new email for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param emailData - The email data to create
 * @returns Promise with the created email data
 */
export async function createCustomerEmail(
  location: string,
  customerId: number,
  emailData: CreateEmailRequest["data"]
): Promise<EmailResponse | null> {
  try {
    const requestBody: CreateEmailRequest = {
      type: "email",
      data: emailData,
    };

    const response = await apiClient.post<EmailResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };

    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to create email",
      data: [],
    };
  }
}

/**
 * Update an existing email for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param emailData - The email data to update (must include id)
 * @returns Promise with the updated email data
 */
export async function updateCustomerEmail(
  location: string,
  customerId: number,
  emailData: UpdateEmailRequest["data"]
): Promise<EmailResponse | null> {
  try {
    const requestBody: UpdateEmailRequest = {
      type: "email",
      data: emailData,
    };

    const response = await apiClient.put<EmailResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update email",
      data: [],
    };
  }
}

/**
 * Delete a customer's email
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param emailId - The email ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteCustomerEmail(
  location: string,
  customerId: number,
  emailId: string
): Promise<DeleteEmailResponse | null> {
  try {
    const requestBody: DeleteEmailRequest = {
      type: "email",
      id: emailId,
    };

    const response = await apiClient.delete<DeleteEmailResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      {
        data: requestBody,
      }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to delete email",
      data: {
        id: emailId,
        type: "email",
        deleted: false,
      },
    };
  }
}

/**
 * Get customer's email information
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with the email data array
 */
export async function getCustomerEmails(
  location: string,
  customerId: number
): Promise<EmailData[]> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        email: EmailData[];
      };
    }>(`/admin/v2/${location}/customers/${customerId}/info`);

    if (response.data.success && response.data.data.email) {
      return response.data.data.email;
    }

    return [];
  } catch {
    return [];
  }
}