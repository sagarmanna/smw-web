"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { TaxAdjustmentData } from "../components/modals/AdjustTaxModal";
import { updateTotals } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";
import { adjustInvoiceTax } from "../[id]/invoices-details.api";
import { parseMoney } from "../[id]/invoices-details.utils";

interface UseInvoiceTaxHandlersProps {
  location: string;
  invoiceId: number;
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceTaxHandlers({
  location,
  invoiceId,
  invoiceDetail,
  dispatch,
}: UseInvoiceTaxHandlersProps) {
  const handleAdjustTax = React.useCallback(
    async (adjustmentData: TaxAdjustmentData) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        const response = await adjustInvoiceTax(
          location,
          invoiceId,
          adjustmentData.adjustment
        );

        if (response && response.success && response.data?.body) {
          const { tax, total, balance } = response.data.body;

          // Build a new totals object using returned values (preserve discounts/subtotal/paid)
          const newTotals = {
            ...invoiceDetail.totals,
            tax: parseMoney(tax),
            total: parseMoney(total),
            balance: parseMoney(balance),
          };

          dispatch(updateTotals(newTotals));
          toast.success(TOAST_MESSAGES.SUCCESS.TAX_ADJUSTED);
        } else {
          toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
        }
      } catch (error) {
        console.error("Failed to adjust tax:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [location, invoiceId, invoiceDetail, dispatch]
  );

  return {
    handleAdjustTax,
  };
}
