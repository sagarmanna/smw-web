/**
 * Error handling utilities for consistent error management across invoice module
 */

import { toast } from "sonner";
import { TOAST_MESSAGES } from "../utils/constants";

export type ErrorContext = "return" | "void" | "discount" | "payment" | "generic";

/**
 * Standardized error handling with logging and toast
 */
export function handleInvoiceError(
  error: unknown,
  context: ErrorContext,
  customMessage?: string
): string {
  const errorMessage = customMessage || getContextErrorMessage(context);
  
  console.error(`[${context}] Invoice operation failed:`, error);
  toast.error(errorMessage);
  
  return errorMessage;
}

/**
 * Get context-specific error message
 */
function getContextErrorMessage(context: ErrorContext): string {
  const messages: Record<ErrorContext, string> = {
    return: TOAST_MESSAGES.ERROR.FAILED_TO_SAVE,
    void: TOAST_MESSAGES.ERROR.FAILED_TO_SAVE,
    discount: TOAST_MESSAGES.ERROR.FAILED_TO_SAVE,
    payment: "Failed to receive payment",
    generic: TOAST_MESSAGES.ERROR.FAILED_TO_SAVE,
  };

  return messages[context];
}

/**
 * Execute async operation with standardized error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  onSuccess?: (result: T) => void | Promise<void>
): Promise<T | null> {
  try {
    const result = await operation();
    onSuccess?.(result);
    return result;
  } catch (error) {
    handleInvoiceError(error, context);
    return null;
  }
}
