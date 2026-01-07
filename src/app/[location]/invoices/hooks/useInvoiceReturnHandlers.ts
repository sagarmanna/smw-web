"use client";

import * as React from "react";
import { toast } from "sonner";
import { InvoiceDetail } from "../mockData/invoiceDetailMockData";

interface UseInvoiceReturnHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  updateInvoiceDetail: (updater: (prev: InvoiceDetail | null) => InvoiceDetail | null) => void;
  onReturnComplete?: () => void;
}

export function useInvoiceReturnHandlers({
  invoiceDetail,
  updateInvoiceDetail,
  onReturnComplete,
}: UseInvoiceReturnHandlersProps) {
  const [isReturning, setIsReturning] = React.useState(false);

  const handleReturnConfirm = React.useCallback(() => {
    if (!invoiceDetail) return;

    setIsReturning(true);

    // Simulate API call
    setTimeout(() => {
      updateInvoiceDetail((prev) => {
        if (!prev) return null;

        // Update status to Returned
        const updatedStatus = "Returned";

        // Make all values negative for returned invoice
        const updatedItems = prev.items.map((item) => ({
          ...item,
          qty: -Math.abs(item.qty),
          price: -Math.abs(item.price),
        }));

        // Update payments - if already paid, keep existing payments but make amounts negative
        // If not paid, add a new payment entry
        const updatedPayments =
          prev.payments.length > 0
            ? prev.payments.map((payment) => ({
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
                  ref: `I-${prev.id - 26}`,
                  notes: "",
                  amount: -Math.abs(prev.totals.total),
                },
              ];

        // Update totals to negative
        const updatedTotals = {
          discounts: -Math.abs(prev.totals.discounts),
          subtotal: -Math.abs(prev.totals.subtotal),
          tax: prev.totals.tax,
          total: -Math.abs(prev.totals.total),
          paid: -Math.abs(prev.totals.total),
          balance: 0,
        };

        return {
          ...prev,
          status: updatedStatus,
          items: updatedItems,
          payments: updatedPayments,
          totals: updatedTotals,
        };
      });

      setIsReturning(false);
      if (onReturnComplete) {
        onReturnComplete();
      }
      toast.success("Invoice returned successfully");
    }, 500);
  }, [invoiceDetail, updateInvoiceDetail, onReturnComplete]);

  return {
    handleReturnConfirm,
    isReturning,
  };
}

