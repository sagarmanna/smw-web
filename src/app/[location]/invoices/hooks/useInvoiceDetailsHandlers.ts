"use client";

import * as React from "react";
import { toast } from "sonner";
import { InvoiceDetail } from "../mockData/invoiceDetailMockData";

interface UseInvoiceDetailsHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  updateInvoiceDetail: (updater: (prev: InvoiceDetail | null) => InvoiceDetail | null) => void;
}

export function useInvoiceDetailsHandlers({
  invoiceDetail,
  updateInvoiceDetail,
}: UseInvoiceDetailsHandlersProps) {
  const handleSaveDetails = React.useCallback(
    async (updatedInvoice: Partial<InvoiceDetail>): Promise<boolean> => {
      if (!invoiceDetail) {
        toast.error("Invoice not found");
        return false;
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateInvoiceDetail((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...updatedInvoice,
          };
        });

        toast.success("Invoice date updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save invoice details:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save invoice details. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [invoiceDetail, updateInvoiceDetail]
  );

  return {
    handleSaveDetails,
  };
}

