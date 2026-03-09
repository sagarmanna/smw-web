"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { updateMessage } from "../[id]/invoices-details.slice";
import { createInvoiceMessage, updateInvoiceMessage } from "../[id]/invoices-details.api";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceMessageHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
}

export function useInvoiceMessageHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
}: UseInvoiceMessageHandlersProps) {
  const handleSaveMessage = React.useCallback(
    async (message: string) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        const hasExistingMessage = (invoiceDetail.message ?? "").trim().length > 0;
        let result = hasExistingMessage
          ? await updateInvoiceMessage(location, invoiceId, { message })
          : await createInvoiceMessage(location, invoiceId, { message });

        // Fallback for stale UI state or backend-side message state mismatch.
        if (!result?.success) {
          const errorMessage = (result?.message || "").toLowerCase();

          if (hasExistingMessage && errorMessage.includes("no existing message")) {
            result = await createInvoiceMessage(location, invoiceId, { message });
          } else if (!hasExistingMessage && errorMessage.includes("already exists")) {
            result = await updateInvoiceMessage(location, invoiceId, { message });
          }
        }

        if (!result?.success) {
          toast.error(result?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
          return;
        }

        // Update Redux state only when server update succeeds
        dispatch(updateMessage(message));

        toast.success(TOAST_MESSAGES.SUCCESS.MESSAGE_SAVED);
      } catch (error) {
        console.error("Failed to save message:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch, location, invoiceId]
  );

  return {
    handleSaveMessage,
  };
}

