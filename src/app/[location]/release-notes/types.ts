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
  sort?: "subject" | "scheduleDate" | "createdDate";
  order?: "asc" | "desc";
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
 */
export interface CreateReleaseNoteRequest {
  subject: string;
  summary: string;
  notes: string;
  scheduleDate: string; // ISO date string format (yyyy-MM-dd)
}

/**
 * Create Release Note Response - API response after creating a release note
 */
export interface CreateReleaseNoteResponse {
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

/**
 * Update Release Note Request - payload for updating an existing release note
 */
export interface UpdateReleaseNoteRequest {
  subject: string;
  summary: string;
  notes: string;
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


