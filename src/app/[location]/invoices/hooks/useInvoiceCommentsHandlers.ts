"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { fetchInvoiceComments } from "../[id]/invoices-details.slice";
import { createComment } from "@/lib/api/comment.api";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceCommentsHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
}

export function useInvoiceCommentsHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
}: UseInvoiceCommentsHandlersProps) {
  const handleAddComment = React.useCallback(
    async (content: string): Promise<void> => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        throw new Error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      }

      try {
        await createComment(location, invoiceId, 4, { content });

        // Refresh comments from server to ensure UI matches backend ordering/pagination
        await dispatch(fetchInvoiceComments({ location, invoiceId, page: 1 })).unwrap();

        toast.success(TOAST_MESSAGES.SUCCESS.COMMENT_ADDED);
      } catch (error) {
        console.error("Failed to add comment:", error);
        const message =
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message?: string }).message)
            : "Failed to add comment";
        toast.error(message);
        throw error; // Re-throw to be handled by component
      }
    },
    [dispatch, invoiceDetail, invoiceId, location]
  );

  return {
    handleAddComment,
  };
}

