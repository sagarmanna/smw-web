/**
 * Release Notes API file
 */

import { apiClient } from "@/lib/api/client";
import type {
  ReleaseNoteRow,
  ReleaseNotesQuery,
  ReleaseNotesListResponse,
  CreateReleaseNoteRequest,
  CreateReleaseNoteResponse,
  UpdateReleaseNoteRequest,
  UpdateReleaseNoteResponse,
} from "./types";

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

// Helper to create empty response - DRY principle
const createEmptyReleaseNotesResponse = (): ReleaseNotesListResponse => ({
  success: false,
  message: "Failed to fetch release notes",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Raw API response structure for a release note
 * The API returns 'date' instead of 'createdDate'
 */
interface RawReleaseNoteFromAPI {
  id: number;
  subject: string;
  summary: string;
  notes: string;
  scheduleDate: string;
  date: string; // API returns 'date' field
  userId?: number;
  userPublicIdentity: string;
  isRead?: boolean;
  isDeleted?: boolean;
  releaseVersion?: string;
  createdDate?: string; // May also be present
}

/**
 * Fetches release notes list from the API
 * 
 * @param location - Location parameter
 * @param query - Query parameters for pagination
 * @returns Promise resolving to release notes list response
 * 
 * @example
 * ```typescript
 * const releaseNotes = await getReleaseNotesList('location1', { page: 1, limit: 20 });
 * ```
 */
export async function getReleaseNotesList(
  location: string,
  query: ReleaseNotesQuery
): Promise<ReleaseNotesListResponse> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) {
      params.append("limit", query.limit.toString());
    }

    // Add sorting parameters
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortDir) params.append("sortDir", query.sortDir);

    // Make API call to the release notes endpoint
    const response = await apiClient.get<ReleaseNotesListResponse>(
      `/admin/v2/${location}/release-notes`,
      { params }
    );

    // Transform API response to match expected structure
    // API returns 'date' field but we need 'createdDate'
    if (response.data && response.data.success && response.data.data) {
      const rawBody = response.data.data.body as RawReleaseNoteFromAPI[];
      const transformedBody: ReleaseNoteRow[] = rawBody.map((note) => ({
        id: note.id,
        subject: note.subject,
        summary: note.summary,
        notes: note.notes,
        scheduleDate: note.scheduleDate,
        createdDate: note.date || note.createdDate || note.scheduleDate, // Map 'date' to 'createdDate'
        userPublicIdentity: note.userPublicIdentity,
        releaseVersion: note.releaseVersion,
      }));

      return {
        success: response.data.success,
        message: response.data.message || "Release notes retrieved successfully",
        data: {
          body: transformedBody,
          pagination: response.data.data.pagination,
        },
      };
    }

    // If response structure is different, return empty response
    const emptyResponse = createEmptyReleaseNotesResponse();
    emptyResponse.message = "Invalid API response structure";
    return emptyResponse;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyReleaseNotesResponse();
    emptyResponse.message = apiError.response?.data?.message || "Failed to fetch release notes";
    return emptyResponse;
  }
}

/**
 * Update an existing release note
 * 
 * @param location - Location parameter
 * @param id - Release note ID
 * @param data - Release note data to update
 * @returns Promise resolving to update release note response
 * 
 * @example
 * ```typescript
 * const releaseNote = await updateReleaseNote('location1', 32, {
 *   subject: 'Updated Subject',
 *   summary: '<p>Updated summary</p>',
 *   notes: '<p>Updated notes</p>',
 *   scheduleDate: '2025-12-20',
 *   releaseVersion: '2.0.0'
 * });
 * ```
 */
export async function updateReleaseNote(
  location: string,
  id: number | string,
  data: UpdateReleaseNoteRequest
): Promise<UpdateReleaseNoteResponse> {
  try {
    // Parse ID - handle both number and string inputs
    const releaseNoteId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(releaseNoteId)) {
      throw new Error("Invalid release note ID");
    }

    // Prepare request body matching API structure
    // API expects: subject, summary, notes (optional), scheduleDate
    // Note: API may not accept releaseVersion in the request body, but we include it if provided
    const requestBody: {
      subject: string;
      summary: string;
      notes?: string;
      scheduleDate: string;
      version?: string;
    } = {
      subject: data.subject,
      summary: data.summary,
      scheduleDate: data.scheduleDate,
    };

    // Only include notes if it has content (notes is optional)
    if (data.notes && data.notes.trim()) {
      requestBody.notes = data.notes;
    }

    // Include version if provided (following createReleaseNote pattern)
    if (data.releaseVersion && typeof data.releaseVersion === 'string') {
      requestBody.version = data.releaseVersion.trim();
    }

    // Make API call to update release note
    const response = await apiClient.put<UpdateReleaseNoteResponse>(
      `/admin/v2/${location}/release-notes/${releaseNoteId}`,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: {
          success?: boolean;
          errorCode?: string;
          message?: string | string[];
        };
        status?: number;
        statusText?: string;
      };
      message?: string;
    };
    
    console.error("Error updating release note:", error);
    
    // Handle API error response
    if (apiError.response?.data) {
      const errorData = apiError.response.data;
      // Handle message as either string or array
      let errorMessage = "Failed to update release note";
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      }
      
      throw {
        message: errorMessage,
        errorCode: errorData.errorCode || (errorData.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      };
    }
    
    // Handle network/other errors
    throw {
      message: apiError.message || "Failed to update release note",
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}

// Re-export types for convenience
export type {
  ReleaseNoteRow,
  ReleaseNotesQuery,
  ReleaseNotesListResponse,
  CreateReleaseNoteRequest,
  CreateReleaseNoteResponse,
  UpdateReleaseNoteRequest,
  UpdateReleaseNoteResponse,
} from "./types";

/**
 * Creates a new release note
 * 
 * @param location - Location parameter
 * @param data - Release note data (subject, summary, notes, scheduleDate, version)
 * @returns Promise resolving to create release note response
 * 
 * @example
 * ```typescript
 * const releaseNote = await createReleaseNote('location1', { 
 *   subject: 'Release 2.3.0', 
 *   summary: '<p>Summary content</p>',
 *   notes: '<p>Detailed notes</p>',
 *   scheduleDate: '2025-12-19',
 *   version: '1.0.0'
 * });
 * ```
 */
export async function createReleaseNote(
  location: string,
  data: CreateReleaseNoteRequest
): Promise<CreateReleaseNoteResponse> {
  try {
    // Prepare request body matching API structure
    // Ensure version is always a string (required by API)
    const versionValue = data.version && typeof data.version === 'string' 
      ? data.version.trim() 
      : "";
    
    const requestBody: {
      subject: string;
      summary: string;
      notes?: string;
      scheduleDate: string;
      version: string;
    } = {
      subject: data.subject,
      summary: data.summary,
      scheduleDate: data.scheduleDate,
      version: versionValue, // Always include as string (can be empty)
    };

    // Only include notes if it has content
    if (data.notes && data.notes.trim()) {
      requestBody.notes = data.notes;
    }

    // Make API call to create release note
    const response = await apiClient.post<CreateReleaseNoteResponse>(
      `/admin/v2/${location}/release-notes`,
      requestBody
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: {
          success?: boolean;
          errorCode?: string;
          message?: string | string[];
        };
        status?: number;
        statusText?: string;
      };
      message?: string;
    };
    
    console.error("Error creating release note:", error);
    
    // Handle API error response
    if (apiError.response?.data) {
      const errorData = apiError.response.data;
      // Handle message as either string or array
      let errorMessage = "Failed to create release note";
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      }
      
      throw {
        message: errorMessage,
        errorCode: errorData.errorCode || (errorData.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      };
    }
    
    // Handle network/other errors
    throw {
      message: apiError.message || "Failed to create release note",
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}

/**
 * Delete a release note
 * 
 * @param location - Location parameter
 * @param id - Release note ID
 * @returns Promise resolving to delete release note response
 * 
 * @example
 * ```typescript
 * const response = await deleteReleaseNote('location1', 32);
 * ```
 */
export async function deleteReleaseNote(
  location: string,
  id: number | string
): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: number;
    deletedByUserId: number;
    deletedOn: string;
  };
}> {
  try {
    // Parse ID - handle both number and string inputs
    const releaseNoteId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(releaseNoteId)) {
      throw new Error("Invalid release note ID");
    }

    // Make API call to delete release note
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data?: {
        id: number;
        deletedByUserId: number;
        deletedOn: string;
      };
    }>(`/admin/v2/${location}/release-notes/${releaseNoteId}`);

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        data?: {
          success?: boolean;
          errorCode?: string;
          message?: string | string[];
        };
        status?: number;
        statusText?: string;
      };
      message?: string;
    };
    
    console.error("Error deleting release note:", error);
    
    // Handle API error response
    if (apiError.response?.data) {
      const errorData = apiError.response.data;
      // Handle message as either string or array
      let errorMessage = "Failed to delete release note";
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      }
      
      throw {
        message: errorMessage,
        errorCode: errorData.errorCode || (errorData.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      };
    }
    
    // Handle network/other errors
    throw {
      message: apiError.message || "Failed to delete release note",
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}

