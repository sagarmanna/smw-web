"use client";

import * as React from "react";
import { InvoiceDetail, InvoiceItem } from "../mockData/invoiceDetailMockData";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";

interface UseInvoiceDiscountHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  updateInvoiceDetail: (updater: (prev: InvoiceDetail | null) => InvoiceDetail | null) => void;
  onDiscountWarning?: (show: boolean) => void;
}

export function useInvoiceDiscountHandlers({
  invoiceDetail,
  updateInvoiceDetail,
  onDiscountWarning,
}: UseInvoiceDiscountHandlersProps) {
  const handleSaveDiscount = React.useCallback(
    (selectedItemIds: string[], discountData: DiscountData) => {
      if (!invoiceDetail) return;

      // Check if any discount value is non-zero (non-approved discount)
      const hasNonApprovedDiscount =
        discountData.paymentFrequencyDiscountPercent > 0 ||
        discountData.customerDiscountPercent > 0 ||
        discountData.multipleEnrollmentDiscountAmount > 0 ||
        discountData.lineItemDiscountValue > 0;

      // Show warning banner if there's a non-approved discount
      if (hasNonApprovedDiscount && onDiscountWarning) {
        onDiscountWarning(true);
      }

      // Update selected items with the discount
      updateInvoiceDetail((prev) => {
        if (!prev) return null;

        const updatedItems = prev.items.map((item) => {
          if (!selectedItemIds.includes(item.id)) {
            return item;
          }

          // Calculate new discount based on line item discount
          let newDiscount = 0;
          if (discountData.lineItemDiscountType === "fixed") {
            // Fixed dollar amount discount (total discount for the line item)
            newDiscount = discountData.lineItemDiscountValue;
          } else if (discountData.lineItemDiscountType === "percentage") {
            // Percentage discount - apply to the original price
            const originalPrice = item.unitPrice
              ? item.unitPrice * (item.qty || 1)
              : item.price;
            newDiscount = (originalPrice * discountData.lineItemDiscountValue) / 100;
          }

          // Calculate base price before discounts
          const basePrice = item.unitPrice
            ? item.unitPrice * (item.qty || 1)
            : item.price;

          // Apply all discounts to calculate new price
          let adjustedPrice = basePrice;

          // Apply payment frequency discount (percentage)
          if (discountData.paymentFrequencyDiscountPercent > 0) {
            adjustedPrice *=
              1 - discountData.paymentFrequencyDiscountPercent / 100;
          }

          // Apply customer discount (percentage)
          if (discountData.customerDiscountPercent > 0) {
            adjustedPrice *= 1 - discountData.customerDiscountPercent / 100;
          }

          // Apply multiple enrollment discount (fixed amount)
          if (discountData.multipleEnrollmentDiscountAmount > 0) {
            adjustedPrice -= discountData.multipleEnrollmentDiscountAmount;
          }

          // Apply line item discount (fixed amount or already calculated percentage)
          adjustedPrice -= newDiscount;

          // Ensure price doesn't go negative
          const newPrice = Math.max(0, adjustedPrice);

          return {
            ...item,
            discount: newDiscount,
            price: newPrice,
          };
        });

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
    },
    [invoiceDetail, updateInvoiceDetail, onDiscountWarning]
  );

  return {
    handleSaveDiscount,
  };
}

