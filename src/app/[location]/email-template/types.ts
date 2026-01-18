/**
 * Type definitions for Email Template feature
 * Centralized types and interfaces for better maintainability
 */

/**
 * Email Template Row - represents a single email template in the table
 */
export interface EmailTemplateRow {
  id: number;
  type: string;
  subject: string;
  header: string; // HTML content from rich text editor
  footer: string; // HTML content from rich text editor
}

/**
 * Email Template Query - parameters for fetching email templates list
 */
export interface EmailTemplateQuery {
  page?: number;
  limit?: number;
  sortBy?: "type" | "subject";
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
 * Email Template List Response - API response structure
 */
export interface EmailTemplateListResponse {
  success: boolean;
  message: string;
  data: {
    body: EmailTemplateRow[];
    pagination: PaginationMeta;
  };
}

/**
 * Update Email Template Request - payload for updating an existing email template
 */
export interface UpdateEmailTemplateRequest {
  subject: string;
  header: string; // HTML content
  footer: string; // HTML content
}

/**
 * Update Email Template Response - API response after updating an email template
 */
export interface UpdateEmailTemplateResponse {
  success: boolean;
  message: string;
  data?: EmailTemplateRow;
}
