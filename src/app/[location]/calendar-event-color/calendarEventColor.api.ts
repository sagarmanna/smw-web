import { apiClient } from '@/lib/api/client';

// API response item structure
export interface CalendarEventColorItem {
  id: number;
  name: string;
  color: string;
}

// GET API response structure (supports both: data.body or data array)
export interface CalendarEventColorsGetApiResponse {
  success: boolean;
  message: string;
  data: { body: CalendarEventColorItem[] } | CalendarEventColorItem[];
}

// PUT request structure (backend expects `colors` array, with `code` field)
export interface CalendarEventColorUpdateItem {
  id: number;
  code: string;
}

/**
 * Fetch calendar event colors
 */
export async function getCalendarEventColors(
  _location: string
): Promise<CalendarEventColorItem[] | null> {
  try {
    const response = await apiClient.get<CalendarEventColorsGetApiResponse>(
      `/admin/v2/calendar-event-colors`
    );

    if (response.data.success && response.data.data) {
      const data = response.data.data;
      // Handle both response shapes:
      // - { data: { body: [...] } }
      // - { data: [...] }
      if (Array.isArray(data)) return data;
      if ("body" in data && Array.isArray(data.body)) return data.body;
    }

    return null;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Failed to fetch calendar event colors:', apiError.response?.data?.message || error);
    return null;
  }
}

/**
 * Save calendar event colors
 */
export async function saveCalendarEventColors(
  _location: string,
  colors: CalendarEventColorUpdateItem[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.put<{ success: boolean; message: string; data: unknown }>(
      `/admin/v2/calendar-event-colors`,
      { colors }
    );

    return {
      success: response.data.success,
      message: response.data.message || 'Calendar event colors saved successfully',
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to save calendar event colors',
    };
  }
}

