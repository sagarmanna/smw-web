"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail, InvoiceItem } from "../types";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";
import { getInvoiceDetails, updateInvoiceLineItemsDiscount } from "../[id]/invoices-details.api";
import { updateItems, updateTotals } from "../[id]/invoices-details.slice";
import { recalculateTotals } from "../utils/totalsCalculator";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceDiscountHandlersProps {
  location: string;
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  onDiscountWarning?: (show: boolean) => void;
}

export function useInvoiceDiscountHandlers({
  location,
  invoiceDetail,
  dispatch,
  onDiscountWarning,
}: UseInvoiceDiscountHandlersProps) {
  const handleSaveDiscount = React.useCallback(
    async (selectedItemIds: string[], discountData: DiscountData): Promise<boolean> => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return false;
      }

      try {
        const lineItemIds = selectedItemIds
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));

        if (lineItemIds.length === 0) {
          toast.error(TOAST_MESSAGES.ERROR.ITEM_SELECTION_REQUIRED);
          return false;
        }

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

        const saveDiscountResponse = await updateInvoiceLineItemsDiscount(location, {
          lineItemIds,
          lineItemDiscount: Number(discountData.lineItemDiscountValue) || 0,
          lineItemDiscountValueType: discountData.lineItemDiscountType === "percentage" ? 1 : 0,
          customerDiscount: Number(discountData.customerDiscountPercent) || 0,
          paymentFrequencyDiscount: Number(discountData.paymentFrequencyDiscountPercent) || 0,
          multiEnrolmentDiscount: Number(discountData.multipleEnrollmentDiscountAmount) || 0,
        });

        if (!saveDiscountResponse?.success) {
          toast.error(saveDiscountResponse?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
          return false;
        }

        const latestInvoiceResponse = await getInvoiceDetails(location, invoiceDetail.id);
        if (latestInvoiceResponse?.success && latestInvoiceResponse.data?.body) {
          dispatch(updateItems(latestInvoiceResponse.data.body.items));
          dispatch(updateTotals(latestInvoiceResponse.data.body.totals));
          toast.success(saveDiscountResponse.message || TOAST_MESSAGES.SUCCESS.DISCOUNT_APPLIED);
          return true;
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
          invoiceDetail.totals.paid
        );

        // Update Redux state
        dispatch(updateItems(updatedItems));
        dispatch(updateTotals(totals));
        toast.success(saveDiscountResponse.message || TOAST_MESSAGES.SUCCESS.DISCOUNT_APPLIED);
        return true;
      } catch (error) {
        console.error("Failed to apply discount:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
        return false;
      }
    },
    [location, invoiceDetail, dispatch, onDiscountWarning]
  );

  return {
    handleSaveDiscount,
  };
}

