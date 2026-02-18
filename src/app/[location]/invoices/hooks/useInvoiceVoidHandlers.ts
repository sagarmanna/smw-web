"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail, InvoiceStatus } from "../types";
import { updateInvoiceDetail, addHistoryEntry } from "../[id]/invoices-details.slice";
import { API_DELAY, TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceVoidHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceVoidHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceVoidHandlersProps) {
  const [isVoiding, setIsVoiding] = React.useState(false);

  const handleVoidConfirm = React.useCallback(async () => {
    if (!invoiceDetail) {
      toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      return;
    }

    setIsVoiding(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, API_DELAY.MEDIUM));

      // Update invoice to voided state
      const updatedStatus: InvoiceStatus = "Voided";

      // Update Redux state
      dispatch(updateInvoiceDetail({
        status: updatedStatus,
        items: [], // Clear items
        payments: [], // Clear payments
        totals: {
          discounts: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
          paid: 0,
          balance: 0,
        },
      }));

      // Add history entry
      dispatch(addHistoryEntry({
        id: Date.now(),
        createdOn: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        message: `Invoice ${invoiceDetail.number} voided`,
      }));

      setIsVoiding(false);
      toast.success(TOAST_MESSAGES.SUCCESS.INVOICE_VOIDED);
    } catch (error) {
      console.error("Failed to void invoice:", error);
      setIsVoiding(false);
      toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
    }
  }, [invoiceDetail, dispatch]);

  return {
    handleVoidConfirm,
    isVoiding,
  };
}

