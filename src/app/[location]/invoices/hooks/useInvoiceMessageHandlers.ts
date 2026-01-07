"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import { InvoiceDetail } from "../mockData/invoiceDetailMockData";
import { updateMessage } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceMessageHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceMessageHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceMessageHandlersProps) {
  const handleSaveMessage = React.useCallback(
    (message: string) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        // Update Redux state
        dispatch(updateMessage(message));

        toast.success(TOAST_MESSAGES.SUCCESS.MESSAGE_SAVED);
      } catch (error) {
        console.error("Failed to save message:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch]
  );

  return {
    handleSaveMessage,
  };
}

