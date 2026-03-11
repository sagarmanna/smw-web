"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";
import { updateInvoiceLineItemsDiscount } from "../[id]/invoices-details.api";
import { fetchInvoice } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceDiscountHandlersProps {
  location: string;
  invoiceId: number;
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  onDiscountWarning?: (show: boolean) => void;
}

export function useInvoiceDiscountHandlers({
  location,
  invoiceId,
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

        // Refresh full invoice data after discount save
        try {
          await dispatch(fetchInvoice({ location, invoiceId })).unwrap();
          toast.success(saveDiscountResponse.message || TOAST_MESSAGES.SUCCESS.DISCOUNT_APPLIED);
          return true;
        } catch (refreshError) {
          console.error("Invoice refresh after discount save failed:", refreshError);
          toast.success(saveDiscountResponse.message || TOAST_MESSAGES.SUCCESS.DISCOUNT_APPLIED);
          return true;
        }
      } catch (error) {
        console.error("Failed to apply discount:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
        return false;
      }
    },
    [location, invoiceId, invoiceDetail, dispatch, onDiscountWarning]
  );

  return {
    handleSaveDiscount,
  };
}

