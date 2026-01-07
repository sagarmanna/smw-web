"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import { InvoiceDetail, InvoiceComment } from "../mockData/invoiceDetailMockData";
import { addComment } from "../[id]/invoices-details.slice";
import { API_DELAY, TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceCommentsHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceCommentsHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceCommentsHandlersProps) {
  const handleAddComment = React.useCallback(
    async (content: string): Promise<void> => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        throw new Error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, API_DELAY.SHORT));

        // Generate a new comment
        const newComment: InvoiceComment = {
          id: Date.now(), // Simple ID generation for mock data
          content,
          createdUser: "Current User", // In real app, this would come from auth
          createdOn: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };

        // Update Redux state
        dispatch(addComment(newComment));

        toast.success(TOAST_MESSAGES.SUCCESS.COMMENT_ADDED);
      } catch (error) {
        console.error("Failed to add comment:", error);
        throw error; // Re-throw to be handled by component
      }
    },
    [invoiceDetail, dispatch]
  );

  return {
    handleAddComment,
  };
}

