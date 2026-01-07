/**
 * Constants for invoice module
 */

// API simulation delays (in milliseconds)
export const API_DELAY = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
} as const;

// Toast message templates
export const TOAST_MESSAGES = {
  SUCCESS: {
    INVOICE_UPDATED: "Invoice updated successfully",
    CUSTOMER_UPDATED: "Customer updated successfully",
    DISCOUNT_APPLIED: "Discount applied successfully",
    ITEM_UPDATED: "Line item updated successfully",
    ITEM_DELETED: "Line item deleted successfully",
    TAX_ADJUSTED: "Tax adjusted successfully",
    MESSAGE_SAVED: "Message saved successfully",
    COMMENT_ADDED: "Comment added successfully",
    INVOICE_RETURNED: "Invoice returned successfully",
    INVOICE_VOIDED: "Invoice voided successfully",
  },
  ERROR: {
    INVOICE_NOT_FOUND: "Invoice not found",
    FAILED_TO_SAVE: "Failed to save. Please try again.",
    FAILED_TO_LOAD: "Failed to load invoice",
    CONTENT_REQUIRED: "Content cannot be blank.",
    ITEM_SELECTION_REQUIRED: "Please select at least one item to edit discount!",
  },
  INFO: {
    FEATURE_UNDER_PROCESS: "This feature is under process",
  },
} as const;

// Auto-dismiss timer (in milliseconds)
export const DISCOUNT_WARNING_DURATION = 15000; // 15 seconds

