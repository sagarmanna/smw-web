import { apiClient } from "@/lib/api/client";

// Fetch Items Purchased report for a customer
// NOTE: Returns raw API response (no transformations)
export async function getItemsPurchasedReport(
  location: string,
  customerId: string | number,
  params?: Record<string, unknown>
) {
  const response = await apiClient.get(
    `/admin/v2/${location}/customers/${customerId}/item-purchased-report`,
    { params }
  );
  return response.data;
}


