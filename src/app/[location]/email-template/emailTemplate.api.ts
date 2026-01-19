/**
 * Email Template API file
 */

import { apiClient } from "@/lib/api/client";
import type {
  EmailTemplateQuery,
  EmailTemplateListResponse,
  UpdateEmailTemplateRequest,
  UpdateEmailTemplateResponse,
} from "./types";

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

// Helper to create empty response - DRY principle
const createEmptyEmailTemplateResponse = (): EmailTemplateListResponse => ({
  success: false,
  message: "Failed to fetch email templates",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Fetches email templates list from the API
 * 
 * @param location - Location parameter
 * @param query - Query parameters for pagination
 * @returns Promise resolving to email templates list response
 * 
 * @example
 * ```typescript
 * const emailTemplates = await getEmailTemplatesList('location1', { page: 1, limit: 20 });
 * ```
 */
export async function getEmailTemplatesList(
  location: string,
  query: EmailTemplateQuery = {}
): Promise<EmailTemplateListResponse> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) {
      params.append("limit", query.limit.toString());
    }

    // Make API call to the email template endpoint
    // Note: This endpoint doesn't include location in the path (unlike other endpoints)
    const response = await apiClient.get<EmailTemplateListResponse>(
      `/admin/v2/email-template`,
      { params }
    );

    if (response.data && response.data.success && response.data.data) {
      return response.data;
    }

    // If response structure is different, return empty response
    const emptyResponse = createEmptyEmailTemplateResponse();
    emptyResponse.message = "Invalid API response structure";
    return emptyResponse;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyEmailTemplateResponse();
    emptyResponse.message = apiError.response?.data?.message || "Failed to fetch email templates";
    return emptyResponse;
  }
}

/**
 * Update an existing email template
 * 
 * @param location - Location parameter
 * @param id - Email template ID
 * @param data - Email template data to update
 * @returns Promise resolving to update email template response
 * 
 * @example
 * ```typescript
 * const emailTemplate = await updateEmailTemplate('location1', 1, {
 *   subject: 'Updated Subject',
 *   header: '<p>Updated header</p>',
 *   footer: '<p>Updated footer</p>'
 * });
 * ```
 */
export async function updateEmailTemplate(
  location: string,
  id: number | string,
  data: UpdateEmailTemplateRequest
): Promise<UpdateEmailTemplateResponse> {
  try {
    // Parse ID - handle both number and string inputs
    const emailTemplateId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(emailTemplateId)) {
      throw new Error("Invalid email template ID");
    }

    // Prepare request body matching API structure
    const requestBody: {
      subject: string;
      header: string;
      footer: string;
    } = {
      subject: data.subject.trim(),
      header: data.header,
      footer: data.footer,
    };

    // Make API call to update email template
    // Note: API is not ready yet, so this is a placeholder
    // TODO: Uncomment when API is ready
    // Note: This endpoint doesn't include location in the path (unlike other endpoints)
    // const response = await apiClient.put<UpdateEmailTemplateResponse>(
    //   `/admin/v2/email-template/${emailTemplateId}`,
    //   requestBody
    // );

    // return response.data;

    // Placeholder response for now (API not ready)
    return {
      success: true,
      message: "Email template updated successfully (API placeholder)",
      data: {
        id: emailTemplateId,
        type: "",
        subject: requestBody.subject,
        header: requestBody.header,
        footer: requestBody.footer,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: {
          success?: boolean;
          errorCode?: string;
          message?: string | string[];
        };
        status?: number;
        statusText?: string;
      };
      message?: string;
    };
    
    console.error("Error updating email template:", error);
    
    // Handle API error response
    if (apiError.response?.data) {
      const errorData = apiError.response.data;
      // Handle message as either string or array
      let errorMessage = "Failed to update email template";
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      }
      
      throw {
        message: errorMessage,
        errorCode: errorData.errorCode || (errorData.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      };
    }
    
    // Handle network/other errors
    throw {
      message: apiError.message || "Failed to update email template",
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}

// Re-export types for convenience
export type {
  EmailTemplateRow,
  EmailTemplateQuery,
  EmailTemplateListResponse,
  UpdateEmailTemplateRequest,
  UpdateEmailTemplateResponse,
} from "./types";
