"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail, InvoiceStatus } from "../types";
import { updateInvoiceDetail } from "../[id]/invoices-details.slice";
import { API_DELAY, TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceReturnHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  onReturnComplete?: () => void;
}

export function useInvoiceReturnHandlers({
  invoiceDetail,
  dispatch,
  onReturnComplete,
}: UseInvoiceReturnHandlersProps) {
  const [isReturning, setIsReturning] = React.useState(false);

  const handleReturnConfirm = React.useCallback(async () => {
    if (!invoiceDetail) {
      toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
      return;
    }

    setIsReturning(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, API_DELAY.MEDIUM));

      // Update status to Returned
      const updatedStatus: InvoiceStatus = "Returned";

      // Make all values negative for returned invoice
      const updatedItems = invoiceDetail.items.map((item) => ({
        ...item,
        qty: -Math.abs(item.qty),
        price: -Math.abs(item.price),
      }));

      // Update payments - if already paid, keep existing payments but make amounts negative
      // If not paid, add a new payment entry
      const updatedPayments =
        invoiceDetail.payments.length > 0
          ? invoiceDetail.payments.map((payment) => ({
              ...payment,
              amount: -Math.abs(payment.amount),
            }))
          : [
              {
                id: "1",
                date: (() => {
                  const now = new Date();
                  const month = now.toLocaleDateString("en-US", { month: "short" });
                  const day = now.getDate().toString().padStart(2, "0");
                  const year = now.getFullYear();
                  return `${month} ${day}, ${year}`;
                })(),
                type: "Credit Used",
                ref: `I-${invoiceDetail.id - 26}`,
                notes: "",
                amount: -Math.abs(invoiceDetail.totals.total),
              },
            ];

      // Update totals to negative
      const updatedTotals = {
        discounts: -Math.abs(invoiceDetail.totals.discounts),
        subtotal: -Math.abs(invoiceDetail.totals.subtotal),
        tax: invoiceDetail.totals.tax,
        total: -Math.abs(invoiceDetail.totals.total),
        paid: -Math.abs(invoiceDetail.totals.total),
        balance: 0,
      };

      // Update Redux state
      dispatch(updateInvoiceDetail({
        status: updatedStatus,
        items: updatedItems,
        payments: updatedPayments,
        totals: updatedTotals,
      }));

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
  }, [invoiceDetail, dispatch, onReturnComplete]);

  return {
    handleReturnConfirm,
    isReturning,
  };
}

