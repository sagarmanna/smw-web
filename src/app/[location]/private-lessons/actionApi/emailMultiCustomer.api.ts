import { apiClient } from "@/lib/api/client";

export interface GetEmailMultiCustomerResponse {
  success: boolean;
  data: {
    body: {
      emails: string[];
      subject: string;
    };
  };
  message?: string;
}

export interface SendEmailMultiCustomerRequest {
  lessonIds: number[];
  to: string[];
  subject: string;
  content: string;
}

export interface SendEmailMultiCustomerResponse {
  success: boolean;
  data: {
    body: {
      isSent: boolean;
      recipientCount: number;
    };
  };
  message?: string;
}

interface GetEmailMultiCustomerApiResponse {
  success: boolean;
  data?: {
    body?: {
      emails?: string[];
      subject?: string;
    };
  };
  message?: string;
}

interface SendEmailMultiCustomerApiResponse {
  success: boolean;
  data?: {
    body?: {
      isSent?: boolean;
      recipientCount?: number;
    };
  };
  message?: string;
}

/**
 * GET /admin/v2/{location}/private-lesson/email-multi-customer?lessonIds=...
 * Returns recipient emails and default subject for the selected lesson ids.
 * Throws on failure so callers can show API response message.
 */
export async function getEmailMultiCustomer(
  location: string,
  lessonIds: number[]
): Promise<GetEmailMultiCustomerResponse> {
  const params = new URLSearchParams();
  lessonIds.forEach((id) => params.append("lessonIds", String(id)));

  const response = await apiClient.get<GetEmailMultiCustomerApiResponse>(
    `/admin/v2/${location}/private-lesson/email-multi-customer?${params.toString()}`
  );

  const body = response.data;
  const rawBody = body?.data?.body;
  const emails = Array.isArray(rawBody?.emails) ? rawBody.emails : [];
  const subject = typeof rawBody?.subject === "string" ? rawBody.subject : "";

  if (!body?.success) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to load email recipients"
    );
  }

  return {
    success: true,
    data: { body: { emails, subject } },
    message: body?.message,
  };
}

/**
 * POST /admin/v2/{location}/private-lesson/email-multi-customer/send
 * Sends one email to the selected lesson customers.
 * Throws on failure so callers can show API response message.
 */
export async function sendEmailMultiCustomer(
  location: string,
  payload: SendEmailMultiCustomerRequest
): Promise<SendEmailMultiCustomerResponse> {
  const response = await apiClient.post<SendEmailMultiCustomerApiResponse>(
    `/admin/v2/${location}/private-lesson/email-multi-customer/send`,
    payload
  );

  const body = response.data;
  const rawBody = body?.data?.body;
  const isSent = rawBody?.isSent === true;
  const recipientCount =
    typeof rawBody?.recipientCount === "number" ? rawBody.recipientCount : 0;

  if (!body?.success) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to send email"
    );
  }

  return {
    success: true,
    data: { body: { isSent, recipientCount } },
    message: body?.message,
  };
}
