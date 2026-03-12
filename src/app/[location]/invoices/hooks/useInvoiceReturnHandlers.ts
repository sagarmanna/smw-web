"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { fetchInvoice } from "../[id]/invoices-details.slice";
import { returnInvoice } from "../[id]/invoices-details.api";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceReturnHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
  onReturnComplete?: () => void;
}

export function useInvoiceReturnHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
  onReturnComplete,
}: UseInvoiceReturnHandlersProps) {
  const router = useRouter();
  const [isReturning, setIsReturning] = React.useState(false);

  const handleReturnConfirm = React.useCallback(async () => {
    if (!invoiceDetail) {
      toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      return;
    }

    setIsReturning(true);

    try {
      const response = await returnInvoice(location, invoiceId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to return invoice");
      }

      const creditInvoiceId = response.data?.creditInvoiceId;
      if (typeof creditInvoiceId === "number" && creditInvoiceId > 0) {
        router.push(`/${location}/invoices/${creditInvoiceId}`);
      } else {
        await dispatch(fetchInvoice({ location, invoiceId })).unwrap();
      }

      setIsReturning(false);
      if (onReturnComplete) {
        onReturnComplete();
      }
      toast.success(TOAST_MESSAGES.SUCCESS.INVOICE_RETURNED);
    } catch (error) {
      console.error("Failed to return invoice:", error);
      setIsReturning(false);
      toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
    }
  }, [invoiceDetail, dispatch, location, invoiceId, onReturnComplete, router]);

  return {
    handleReturnConfirm,
    isReturning,
  };
}

