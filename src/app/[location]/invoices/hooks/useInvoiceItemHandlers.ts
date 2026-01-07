"use client";

import * as React from "react";
import { toast } from "sonner";
import { InvoiceItem, InvoiceDetail } from "../mockData/invoiceDetailMockData";

interface UseInvoiceItemHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  updateInvoiceDetail: (updater: (prev: InvoiceDetail | null) => InvoiceDetail | null) => void;
}

export function useInvoiceItemHandlers({
  invoiceDetail,
  updateInvoiceDetail,
}: UseInvoiceItemHandlersProps) {
  const handleSaveItem = React.useCallback(
    (updatedItem: InvoiceItem) => {
      if (!invoiceDetail) return;

      updateInvoiceDetail((prev) => {
        if (!prev) return null;

        const updatedItems = prev.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );

        // Recalculate totals
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const totalDiscounts = updatedItems.reduce(
          (sum, item) => sum + (item.discount || 0),
          0
        );
        const tax = prev.totals.tax; // Keep existing tax
        const total = subtotal + tax;
        const paid = prev.totals.paid; // Keep existing paid amount
        const balance = total - paid;

        return {
          ...prev,
          items: updatedItems,
          totals: {
            discounts: totalDiscounts,
            subtotal,
            tax,
            total,
            paid,
            balance,
          },
        };
      });

      toast.success("Line item updated successfully");
    },
    [invoiceDetail, updateInvoiceDetail]
  );

  const handleDeleteItem = React.useCallback(
    (itemId: string) => {
      if (!invoiceDetail) return;

      updateInvoiceDetail((prev) => {
        if (!prev) return null;

        const updatedItems = prev.items.filter((item) => item.id !== itemId);

        // Recalculate totals
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const totalDiscounts = updatedItems.reduce(
          (sum, item) => sum + (item.discount || 0),
          0
        );
        const tax = prev.totals.tax; // Keep existing tax
        const total = subtotal + tax;
        const paid = prev.totals.paid; // Keep existing paid amount
        const balance = total - paid;

        return {
          ...prev,
          items: updatedItems,
          totals: {
            discounts: totalDiscounts,
            subtotal,
            tax,
            total,
            paid,
            balance,
          },
        };
      });

      toast.success("Line item deleted successfully");
    },
    [invoiceDetail, updateInvoiceDetail]
  );

  return {
    handleSaveItem,
    handleDeleteItem,
  };
}

