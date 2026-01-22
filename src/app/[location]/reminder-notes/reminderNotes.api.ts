/**
 * Reminder Notes API and data types
 *
 * Endpoint (per backend): GET /admin/v2/reminder-note?sort=notes&order=ASC|DESC
 */

import { apiClient } from "@/lib/api/client";

const LIST_ENDPOINT = "/admin/v2/reminder-note";
// NOTE: you updated POST/PUT/DELETE to plural in your workspace
const CRUD_ENDPOINT = "/admin/v2/reminder-notes";

export type ReminderNotesOrder = "ASC" | "DESC";

export interface ReminderNoteApiRow {
  id: number | string;
  notes?: string; // expected field
  html?: string; // fallback (if backend uses different key)
  createdOn?: string;
  createdByUserId?: number;
  updatedOn?: string;
  updatedByUserId?: number;
}

export interface ReminderNotesQuery {
  sort?: "notes";
  order?: ReminderNotesOrder;
  page?: number;
  limit?: number;
}

// GET API response structure (supports both: data.body or data array)
export interface ReminderNotesGetApiResponse {
  success: boolean;
  message: string;
  data: { body: ReminderNoteApiRow[] } | ReminderNoteApiRow[];
}

export interface ReminderNoteCrudApiResponse {
  success: boolean;
  message: string;
  data?: ReminderNoteApiRow;
}

export interface SaveReminderNoteRequest {
  notes: string;
}

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

const encodeId = (id: number | string) => encodeURIComponent(String(id));

/**
 * Fetch reminder notes (common endpoint, location not required)
 */
export async function getReminderNotes(
  _location: string,
  query: ReminderNotesQuery = {}
): Promise<ReminderNoteApiRow[] | null> {
  try {
    const params: Record<string, unknown> = {};
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;

    const response = await apiClient.get<ReminderNotesGetApiResponse>(
      LIST_ENDPOINT,
      { params }
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
    console.error(
      "Failed to fetch reminder notes:",
      getApiErrorMessage(error, String(error))
    );
    return null;
  }
}

export async function createReminderNote(
  _location: string,
  payload: SaveReminderNoteRequest
): Promise<ReminderNoteCrudApiResponse> {
  try {
    const response = await apiClient.post<ReminderNoteCrudApiResponse>(
      CRUD_ENDPOINT,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to create reminder note"),
    };
  }
}

export async function updateReminderNote(
  _location: string,
  id: number | string,
  payload: SaveReminderNoteRequest
): Promise<ReminderNoteCrudApiResponse> {
  try {
    const response = await apiClient.put<ReminderNoteCrudApiResponse>(
      `${CRUD_ENDPOINT}/${encodeId(id)}`,
      payload
    );
    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to update reminder note"),
    };
  }
}

export async function deleteReminderNote(
  _location: string,
  id: number | string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string; data?: unknown }>(
      `${CRUD_ENDPOINT}/${encodeId(id)}`
    );
    return {
      success: response.data.success,
      message: response.data.message || "Reminder note deleted successfully",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to delete reminder note"),
    };
  }
}


