"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { updateInvoice, updateInvoiceDetail } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceDetailsHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
}

export function useInvoiceDetailsHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
}: UseInvoiceDetailsHandlersProps) {
  const handleSaveDetails = React.useCallback(
    async (updatedInvoice: Partial<InvoiceDetail>): Promise<boolean> => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return false;
      }

      try {
        // Dispatch updateInvoice thunk (which will call API)
        await dispatch(
          updateInvoice({
            location,
            invoiceId,
            data: {
              date: updatedInvoice.date,
              status: updatedInvoice.status,
              customer: updatedInvoice.customer,
              message: updatedInvoice.message,
            },
          })
        ).unwrap();

        toast.success(TOAST_MESSAGES.SUCCESS.INVOICE_UPDATED);
        return true;
      } catch (error) {
        console.error("Failed to save invoice details:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : TOAST_MESSAGES.ERROR.FAILED_TO_SAVE;
        toast.error(errorMessage);
        return false;
      }
    },
    [invoiceDetail, dispatch, location, invoiceId]
  );

  return {
    handleSaveDetails,
  };
}

