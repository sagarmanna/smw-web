"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { TaxAdjustmentData } from "../components/modals/AdjustTaxModal";
import { updateTotals } from "../[id]/invoices-details.slice";
import { recalculateTotals } from "../utils/totalsCalculator";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceTaxHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceTaxHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceTaxHandlersProps) {
  const handleAdjustTax = React.useCallback(
    (adjustmentData: TaxAdjustmentData) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        // Calculate tax from items (sum of all item taxes)
        const taxCalculated = invoiceDetail.items.reduce(
          (sum, item) => sum + (item.tax || 0),
          0
        );

        // Apply adjustment to calculated tax
        const adjustedTax = Math.max(0, taxCalculated + adjustmentData.adjustment);

        // Recalculate totals using utility function
        const totals = recalculateTotals(
          invoiceDetail.items,
          adjustedTax,
          invoiceDetail.totals.paid
        );

        // Update Redux state
        dispatch(updateTotals(totals));

        toast.success(TOAST_MESSAGES.SUCCESS.TAX_ADJUSTED);
      } catch (error) {
        console.error("Failed to adjust tax:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch]
  );

  return {
    handleAdjustTax,
  };
}

