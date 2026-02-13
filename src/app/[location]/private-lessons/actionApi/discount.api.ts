import { apiClient } from "@/lib/api/client";

/** Discount body from GET apply-discount response */
export interface DiscountValuesBody {
  lessonIds: number[];
  customerDiscount: number;
  customerMixed: boolean;
  paymentFrequencyDiscount: number | null;
  paymentFrequencyMixed: boolean;
  multiEnrolmentDiscount: number | null;
  multiEnrolmentMixed: boolean;
  lineItemDiscount: number;
  lineItemDiscountValueType: number; // 0 = $, 1 = %
  lineItemMixed: boolean;
}

export interface GetDiscountValuesResponse {
  success: boolean;
  data: {
    body: DiscountValuesBody;
  };
  message?: string;
}

interface GetDiscountValuesApiResponse {
  success: boolean;
  data: {
    body: DiscountValuesBody;
  };
  message?: string;
}

/**
 * GET /admin/v2/{location}/private-lesson/apply-discount?lessonIds=1,2,3
 * Retrieves current discount values for the given lessons.
 */
export async function getDiscountValues(
  location: string,
  lessonIds: number[]
): Promise<GetDiscountValuesResponse> {
  const params = new URLSearchParams();
  params.set("lessonIds", lessonIds.join(","));

  const response = await apiClient.get<GetDiscountValuesApiResponse>(
    `/admin/v2/${location}/private-lesson/apply-discount`,
    { params }
  );

  const body = response.data;
  if (!body?.success || !body?.data?.body) {
    throw new Error(
      typeof body?.message === "string" && body.message.trim() !== ""
        ? body.message
        : "Failed to retrieve discount values"
    );
  }

  return {
    success: true,
    data: { body: body.data.body },
    message: body.message,
  };
}

/** PUT apply-discount request body */
export interface ApplyDiscountRequest {
  lessonIds: number[];
  customerDiscount: number;
  paymentFrequencyDiscount: number;
  multiEnrolmentDiscount: number;
  lineItemDiscount: number;
  lineItemDiscountValueType: number; // 0 = $, 1 = %
}

export interface ApplyDiscountResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

interface ApplyDiscountApiResponse {
  success: boolean;
  data: {
    lessonIds: number[];
  };
  message?: string;
}

/**
 * PUT /admin/v2/{location}/private-lesson/apply-discount
 * Applies discount values to the given lessons.
 * Throws on HTTP/network error so callers only run success path after a real response.
 */
export async function applyDiscount(
  location: string,
  payload: ApplyDiscountRequest
): Promise<ApplyDiscountResponse> {
  const response = await apiClient.put<ApplyDiscountApiResponse>(
    `/admin/v2/${location}/private-lesson/apply-discount`,
    payload
  );

  const body = response.data;
  const success = body?.success === true;
  const message = body?.message;
  const lessonIds = body?.data?.lessonIds ?? [];

  if (!success) {
    throw new Error(
      typeof message === "string" && message.trim() !== ""
        ? message
        : "Failed to update discount"
    );
  }

  return {
    success: true,
    data: { lessonIds },
    message,
  };
}
