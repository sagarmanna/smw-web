"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { fetchInvoice } from "../[id]/invoices-details.slice";
import { voidInvoice } from "../[id]/invoices-details.api";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceVoidHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
}

export function useInvoiceVoidHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
}: UseInvoiceVoidHandlersProps) {
  const [isVoiding, setIsVoiding] = React.useState(false);

  const handleVoidConfirm = React.useCallback(async () => {
    if (!invoiceDetail) {
      toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      return;
    }

    setIsVoiding(true);

    try {
      const response = await voidInvoice(location, invoiceId, true);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to void invoice");
      }

      await dispatch(fetchInvoice({ location, invoiceId })).unwrap();

      setIsVoiding(false);
      toast.success(TOAST_MESSAGES.SUCCESS.INVOICE_VOIDED);
    } catch (error) {
      console.error("Failed to void invoice:", error);
      setIsVoiding(false);
      toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
    }
  }, [invoiceDetail, dispatch, location, invoiceId]);

  return {
    handleVoidConfirm,
    isVoiding,
  };
}

