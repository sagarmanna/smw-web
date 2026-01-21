/**
 * Test Email API file
 */

import { apiClient } from "@/lib/api/client";
import { extractErrorMessage } from "@/utils/api/createCrudApi";
import type {
  TestEmailListResponse,
  UpdateTestEmailRequest,
  UpdateTestEmailResponse,
} from "./types";

/**
 * Fetch test email list.
 *
 * Note: `location` is part of the page route, but this endpoint is global
 * (similar to `/admin/v2/email-template`).
 */
export async function getTestEmailList(_location: string): Promise<TestEmailListResponse> {
  try {
    const response = await apiClient.get<TestEmailListResponse>(`/admin/v2/test-email`);
    return response.data;
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    return {
      success: false,
      message: message || "Failed to fetch test emails",
      data: {
        body: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      },
    };
  }
}

/**
 * Update a test email address.
 *
 * Uses PUT to update the record.
 */
export async function updateTestEmail(
  _location: string,
  id: number,
  payload: UpdateTestEmailRequest
): Promise<UpdateTestEmailResponse> {
  try {
    const response = await apiClient.put<UpdateTestEmailResponse>(`/admin/v2/test-email/${id}`, {
      email: payload.email.trim(),
    });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string | string[]; errorCode?: string } };
      message?: string;
    };
    const message = extractErrorMessage(error);
    throw {
      message: message || apiError.message || "Failed to update test email",
      errorCode: apiError.response?.data?.errorCode || "INTERNAL_SERVER_ERROR",
    };
  }
}

