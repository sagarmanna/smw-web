/**
 * Release Notes API file
 * Following the same pattern as studentsListing.api.ts and teachersListing.api.ts
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
 * Get a single release note by ID
 * 
 * @param location - Location parameter
 * @param id - Release note ID
 * @returns Promise resolving to release note or null if not found
 * 
 * @todo Implement API call to fetch single release note by ID
 */
export async function getReleaseNoteById(
  location: string,
  id: number | string
): Promise<ReleaseNoteRow | null> {
  try {
    // TODO: Implement API call to fetch single release note
    // Endpoint: GET /admin/v2/${location}/release-notes/{id}
    const releaseNoteId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(releaseNoteId)) {
      return null;
    }

    // Placeholder - API implementation needed
    console.warn("getReleaseNoteById: API implementation needed");
    return null;
  } catch (error) {
    console.error("Error fetching release note:", error);
    return null;
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
 * @todo Implement API call to update release note
 */
export async function updateReleaseNote(
  location: string,
  id: number | string,
  data: UpdateReleaseNoteRequest
): Promise<UpdateReleaseNoteResponse> {
  try {
    // TODO: Implement API call to update release note
    // Endpoint: PUT /admin/v2/${location}/release-notes/{id}
    // Parameters will be used when API is implemented
    void location;
    void data;
    
    const releaseNoteId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(releaseNoteId)) {
      throw new Error("Invalid release note ID");
    }

    // Placeholder - API implementation needed
    console.warn("updateReleaseNote: API implementation needed");
    throw new Error("API implementation needed for updateReleaseNote");
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: UpdateReleaseNoteResponse } };
    console.error("Error updating release note:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to update release note",
      errorCode: apiError.response?.data?.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
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
 * @param data - Release note data (subject, summary, notes, scheduleDate)
 * @returns Promise resolving to create release note response
 * 
 * @example
 * ```typescript
 * const releaseNote = await createReleaseNote('location1', { 
 *   subject: 'Release 2.3.0', 
 *   summary: '<p>Summary content</p>',
 *   notes: '<p>Detailed notes</p>',
 *   scheduleDate: '2025-12-19'
 * });
 * ```
 * 
 * @todo Implement API call to create release note
 */
export async function createReleaseNote(
  location: string,
  data: CreateReleaseNoteRequest
): Promise<CreateReleaseNoteResponse> {
  try {
    // TODO: Implement API call to create release note
    // Endpoint: POST /admin/v2/${location}/release-notes
    // Parameters will be used when API is implemented
    void location;
    void data;
    
    // Placeholder - API implementation needed
    console.warn("createReleaseNote: API implementation needed");
    throw new Error("API implementation needed for createReleaseNote");
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: CreateReleaseNoteResponse } };
    console.error("Error creating release note:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to create release note",
      errorCode: apiError.response?.data?.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
    };
  }
}

