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
