/**
 * Constants for enrolment detail page
 */

export const ENROLMENT_CONSTANTS = {
  // Default values
  DEFAULT_NOT_AVAILABLE: "N/A",
  DEFAULT_NOT_SET: "Not set",
  DEFAULT_YES: "Yes",
  DEFAULT_NO: "No",
  
  // Icon positioning
  ICON_OFFSET_PX: 8,
  ICON_POSITIONING_DELAY_MS: 50,
  
  // Print
  PRINT_WINDOW_LOAD_DELAY_MS: 250,
  
  // Enrolment types
  ENROLMENT_TYPE_PRIVATE: "private" as const,
  ENROLMENT_TYPE_GROUP: "group" as const,
  
  // Email object types
  EMAIL_OBJECT_CUSTOMER_STATEMENT: 8,
  
  // Modal z-index
  MODAL_Z_INDEX: 50,
} as const;

export const ENROLMENT_MESSAGES = {
  LOADING: "Loading enrolment...",
  NOT_FOUND: "Enrolment not found",
  ERROR_TITLE: "Unable to Load Enrolment Details",
  ERROR_FALLBACK: "An unexpected error occurred while loading the enrolment details. Please try again later.",
  PRINT_POPUP_BLOCKED: "Please allow popups to print",
  PRINT_ERROR: "Failed to generate print content. Please try again.",
  ACTION_RECEIVE_PAYMENT: "Receive Payment",
  ACTION_DELETE: "Delete",
  ACTION_PRINT: "Print",
  ACTION_MAIL: "Mail",
  ACTION_FULL_DELETE: "Full Delete",
  ACTION_LABEL: "Action",
} as const;

