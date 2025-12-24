/**
 * Type definitions for Release Notes feature
 * Centralized types and interfaces for better maintainability
 */

/**
 * Release Note Row - represents a single release note in the table
 */
export interface ReleaseNoteRow {
  id?: number; // Optional - may not be present in API response
  releaseVersion?: string; // Release Version# (optional)
  subject: string;
  summary: string; // HTML content from rich text editor
  notes: string; // HTML content from rich text editor
  scheduleDate: string; // Format: "MMM dd, yyyy" (e.g., "Dec 16, 2025")
  createdDate: string; // Format: "MMM dd, yyyy" (e.g., "Dec 16, 2025")
  userPublicIdentity: string;
}

/**
 * Release Notes Query - parameters for fetching release notes list
 */
export interface ReleaseNotesQuery {
  page?: number;
  limit?: number;
  subject?: string;
  sortBy?: "subject" | "scheduleDate" | "createdDate" | "id";
  sortDir?: "asc" | "desc";
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Release Notes List Response - API response structure
 */
export interface ReleaseNotesListResponse {
  success: boolean;
  message: string;
  data: {
    body: ReleaseNoteRow[];
    pagination: PaginationMeta;
  };
}

/**
 * Create Release Note Request - payload for creating a new release note
 * Matches API request body structure
 * Note: version is required and cannot be empty
 * Notes is optional (can be empty or omitted)
 */
export interface CreateReleaseNoteRequest {
  subject: string;
  summary: string;
  notes?: string; // Optional - can be empty or omitted
  scheduleDate: string; // ISO date string format (yyyy-MM-dd)
  version: string; // Release version (required, cannot be empty)
}

/**
 * Create Release Note Response - API response after creating a release note
 * API returns minimal data, so we'll merge with request data
 */
export interface CreateReleaseNoteResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    subject: string;
    scheduleDate: string; // ISO format from API (e.g., "2025-12-20T02:00:00.000Z")
    createdByUserId: number;
  };
}

/**
 * Update Release Note Request - payload for updating an existing release note
 * Notes is optional (can be empty or omitted)
 */
export interface UpdateReleaseNoteRequest {
  subject: string;
  summary: string;
  notes?: string; // Optional - can be empty or omitted
  scheduleDate: string; // ISO date string format (yyyy-MM-dd)
  releaseVersion?: string;
}

/**
 * Update Release Note Response - API response after updating a release note
 */
export interface UpdateReleaseNoteResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    subject: string;
    summary: string;
    notes: string;
    scheduleDate: string;
    createdDate: string;
    userPublicIdentity: string;
  };
}


