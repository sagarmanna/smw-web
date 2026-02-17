"use client";

import * as React from "react";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail, InvoiceItem } from "../types";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";
import { updateItems, updateTotals } from "../[id]/invoices-details.slice";
import { recalculateTotals } from "../utils/totalsCalculator";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceDiscountHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  onDiscountWarning?: (show: boolean) => void;
}

export function useInvoiceDiscountHandlers({
  invoiceDetail,
  dispatch,
  onDiscountWarning,
}: UseInvoiceDiscountHandlersProps) {
  const handleSaveDiscount = React.useCallback(
    (selectedItemIds: string[], discountData: DiscountData) => {
      if (!invoiceDetail) {
        return;
      }

      try {
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
        const updatedItems = invoiceDetail.items.map((item) => {
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

        // Recalculate totals using utility function
        const totals = recalculateTotals(
          updatedItems,
          invoiceDetail.totals.tax,
          invoiceDetail.totals.paid
        );

        // Update Redux state
        dispatch(updateItems(updatedItems));
        dispatch(updateTotals(totals));
      } catch (error) {
        console.error("Failed to apply discount:", error);
        // Error toast is handled by the component calling this
      }
    },
    [invoiceDetail, dispatch, onDiscountWarning]
  );

  return {
    handleSaveDiscount,
  };
}

