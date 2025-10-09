import { apiClient } from "@/lib/api/client";

export interface LocationStats {
  name: string;
  activeEnrolments: number;
  revenue: number;
  royalty: number;
  advertisement: number;
  hst: number;
  total: number;
}

// Safely parse numbers that might come as strings like "33,550.40"
function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function readFirst(item: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      return (item as Record<string, unknown>)[key];
    }
  }
  return undefined;
}

function findValueByKeyPattern(
  input: unknown,
  pattern: RegExp,
  depth = 3
): unknown {
  if (depth < 0 || input == null) return undefined;
  if (Array.isArray(input)) return undefined;
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (pattern.test(k)) return v;
    }
    for (const v of Object.values(obj)) {
      const found = findValueByKeyPattern(v, pattern, depth - 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

// Recursively find the first array of objects in any nested response shape
function findFirstArrayOfObjects(input: unknown, maxDepth = 5): Record<string, unknown>[] | null {
  if (maxDepth < 0 || input == null) return null;
  if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === "object" && input[0] !== null) {
      return input as Record<string, unknown>[];
    }
    return null;
  }
  if (typeof input === "object") {
    for (const value of Object.values(input as Record<string, unknown>)) {
      const found = findFirstArrayOfObjects(value, maxDepth - 1);
      if (found) return found;
    }
  }
  return null;
}

export async function getAllLocationsData({
  location,
  startDate,
  endDate,
}: {
  location: string;
  startDate: string;
  endDate: string;
}): Promise<{ success: boolean; data: LocationStats[]; message?: string; }> {
  try {
    const response = await apiClient.get(`/admin/v2/${location}/report/all-locations`, {
      params: { startDate, endDate },
    });

    const locationDataArray = findFirstArrayOfObjects(response.data) || [];

    if (locationDataArray.length > 0) {
      const transformedData = locationDataArray.map((item: Record<string, unknown>) => ({
        name:
          (item.name as string) ||
          (item.location as string) ||
          (item.locationName as string) ||
          (item.location_name as string) ||
          "Unknown",
        activeEnrolments: toNumber(
          readFirst(item, [
            'activeEnrolments', 'active_enrolments', 'activeEnrollments', 'active_enrollments',
            'activeStudents', 'active_students', 'active', 'enrolments', 'enrollments'
          ]) ?? findValueByKeyPattern(item, /active.*(enrol|enroll|student|count)/i)
        ),
        revenue: toNumber(readFirst(item, ['revenue', 'revenueAmount'])),
        royalty: toNumber(readFirst(item, ['locationDebtValueRoyalty', 'royalty'])),
        advertisement: toNumber(readFirst(item, ['locationDebtValueAdvertisement', 'advertisement'])),
        hst: toNumber(readFirst(item, ['taxAmount', 'hst'])),
        total: toNumber(readFirst(item, ['total', 'grandTotal'])),
      }));
      return { success: true, data: transformedData };
    }
    return { success: true, data: [] };
  } catch (error) {
    const apiError = error as { message?: string };
    return { success: false, data: [], message: apiError.message || 'Error fetching data' };
  }
}
