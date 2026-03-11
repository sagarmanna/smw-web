"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { fetchInvoice } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

type InvoiceActionResponse = {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

interface UseInvoiceActionHandlerProps<R extends InvoiceActionResponse = InvoiceActionResponse> {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
  actionFn: (location: string, invoiceId: number) => Promise<R>;
  successMessage: string;
  errorMessage: string;
  onSuccess?: (response: R) => Promise<void> | void;
  shouldNavigateTo?: (response: R) => string | null;
}

/**
 * Reusable hook for common invoice action patterns (return, void, etc.)
 * Eliminates duplication in return/void handlers
 */
export function useInvoiceActionHandler<R extends InvoiceActionResponse = InvoiceActionResponse>({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
  actionFn,
  successMessage,
  errorMessage,
  onSuccess,
  shouldNavigateTo,
}: UseInvoiceActionHandlerProps<R>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const executeAction = React.useCallback(async () => {
    if (!invoiceDetail) {
      toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      return;
    }

    setIsLoading(true);

    try {
      const response = await actionFn(location, invoiceId);
      
      if (!response?.success) {
        throw new Error(response?.message || errorMessage);
      }

      // Check for navigation target
      if (shouldNavigateTo) {
        const navigationPath = shouldNavigateTo(response);
        if (navigationPath) {
          router.push(navigationPath);
          setIsLoading(false);
          toast.success(response.message || successMessage);
          return;
        }
      }

      // Execute custom success handler
      if (onSuccess) {
        await onSuccess(response);
      } else {
        // Default: refresh invoice data
        await dispatch(fetchInvoice({ location, invoiceId })).unwrap();
      }

      setIsLoading(false);
      toast.success(response.message || successMessage);
    } catch (error) {
      console.error("Invoice action failed:", error);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  }, [invoiceDetail, dispatch, location, invoiceId, actionFn, successMessage, errorMessage, onSuccess, shouldNavigateTo, router]);

  return {
    executeAction,
    isLoading,
  };
}
