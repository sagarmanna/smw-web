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
