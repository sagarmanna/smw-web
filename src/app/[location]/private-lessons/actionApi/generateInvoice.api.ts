import { apiClient } from "@/lib/api/client";

export interface GenerateInvoiceRequest {
  lessonIds: number[];
}

export interface GenerateInvoiceResponse {
  success: boolean;
  message?: string;
}

interface GenerateInvoiceApiResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
}

/**
 * POST /admin/v2/{location}/lesson/generate-invoice
 * Generates invoice for the given lessons.
 * Throws on failure or success: false so callers can show API response message.
 */
export async function generateInvoice(
  location: string,
  payload: GenerateInvoiceRequest
): Promise<GenerateInvoiceResponse> {
  const response = await apiClient.post<GenerateInvoiceApiResponse>(
    `/admin/v2/${location}/lesson/generate-invoice`,
    payload
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to generate invoice"
    );
  }

  return {
    success: true,
    message,
  };
}
