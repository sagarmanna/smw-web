/**
 * Location info API
 * Endpoint: GET /admin/v2/{location}/info
 */

import { apiClient } from "@/lib/api/client";
import type { LocationDetails } from "../locations.api";

type LocationInfoApiBody = {
  id?: number;
  name?: string;
  slug?: string;
  details?: {
    email?: string;
    phone?: string;
    royalty?: number;
    advertisement?: number;
    conversionDate?: string;
  };
  address?: {
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
  hstRegistrationNo?: string;
};

export interface LocationDetailApiResponse {
  success: boolean;
  message?: string;
  data: LocationInfoApiBody | { body: LocationInfoApiBody };
}

const hasBody = (
  data: LocationDetailApiResponse["data"]
): data is { body: LocationInfoApiBody } => typeof data === "object" && data !== null && "body" in data;

/**
 * Fetches location info from the API
 * Endpoint: GET /admin/v2/{location}/info
 *
 * @param location - The location identifier (e.g. "training-location")
 * @returns Promise resolving to location details or null on error
 */
export async function getLocationInfo(
  location: string
): Promise<LocationDetails | null> {
  try {
    const response = await apiClient.get<LocationDetailApiResponse>(
      `/admin/v2/${location}/info`
    );

    const { success, data } = response.data;
    if (!success || !data) {
      return null;
    }

    // Support both { data: body } and { data: { body: ... } } shapes
    const body: LocationInfoApiBody = hasBody(data) ? data.body : data;

    // Normalize backend shape to UI-friendly LocationDetails
    return {
      id: body.id,
      name: body.name,
      email: body.details?.email,
      phoneNumber: body.details?.phone,
      royaltyPercent: body.details?.royalty,
      advertisementPercent: body.details?.advertisement,
      conversionDate: body.details?.conversionDate,
      address: body.address?.address,
      city: body.address?.city,
      province: body.address?.province,
      country: body.address?.country,
      postalCode: body.address?.postalCode,
      hstRegistrationNo: body.hstRegistrationNo,
    };
  } catch (error: unknown) {
    console.error("Error fetching location info:", error);
    return null;
  }
}

/** Response may be direct { hst } or wrapped { success, data: { hst } } */
type UpdateHstApiResponse =
  | { hst: string }
  | { success?: boolean; data?: { hst?: string }; hst?: string };

/**
 * Updates HST registration number for a location.
 * Endpoint: POST /admin/v2/{location}/hst-update
 * Body: { hst: string }
 * Response: { "hst": "..." } or { "success": true, "data": { "hst": "..." } }
 */
export async function updateLocationHst(
  location: string,
  hst: string
): Promise<string | null> {
  try {
    const response = await apiClient.post<UpdateHstApiResponse>(
      `/admin/v2/${location}/hst-update`,
      { hst }
    );
    const body = response.data;
    if (!body) return hst; // Fallback to sent value if no body
    // Handle direct { hst } or wrapped { data: { hst } }
    const value =
      (body as { hst?: string }).hst ??
      (body as { data?: { hst?: string } }).data?.hst;
    return value ?? hst; // Fallback to sent value if shape unexpected
  } catch (error) {
    console.error("Error updating HST number:", error);
    return null;
  }
}
