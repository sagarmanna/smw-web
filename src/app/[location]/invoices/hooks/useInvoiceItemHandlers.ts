"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceItem, InvoiceDetail } from "../types";
import { updateItems, updateTotals } from "../[id]/invoices-details.slice";
import { recalculateTotals } from "../utils/totalsCalculator";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceItemHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceItemHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceItemHandlersProps) {
  const handleSaveItem = React.useCallback(
    (updatedItem: InvoiceItem) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        const updatedItems = invoiceDetail.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );

        // Recalculate totals using utility function
        const totals = recalculateTotals(
          updatedItems,
          invoiceDetail.totals.tax,
          invoiceDetail.totals.paid
        );

        // Update Redux state
        dispatch(updateItems(updatedItems));
        dispatch(updateTotals(totals));

        toast.success(TOAST_MESSAGES.SUCCESS.ITEM_UPDATED);
      } catch (error) {
        console.error("Failed to save item:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch]
  );

  const handleDeleteItem = React.useCallback(
    (itemId: string) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        const updatedItems = invoiceDetail.items.filter((item) => item.id !== itemId);

        // Recalculate totals using utility function
        const totals = recalculateTotals(
          updatedItems,
          invoiceDetail.totals.tax,
          invoiceDetail.totals.paid
        );

        // Update Redux state
        dispatch(updateItems(updatedItems));
        dispatch(updateTotals(totals));

        toast.success(TOAST_MESSAGES.SUCCESS.ITEM_DELETED);
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch]
  );

  return {
    handleSaveItem,
    handleDeleteItem,
  };
}

