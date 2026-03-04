"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceItem, InvoiceDetail } from "../types";
import { updateItems, updateTotals } from "../[id]/invoices-details.slice";
import { addInvoiceLineItem, deleteInvoiceLineItem, updateInvoiceLineItem } from "../[id]/invoices-details.api";
import { recalculateTotals } from "../utils/totalsCalculator";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceItemHandlersProps {
  location: string;
  invoiceId: number;
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

function applyItemUpdate(
  dispatch: AppDispatch,
  updatedItems: InvoiceItem[],
  currentTotals: InvoiceDetail["totals"]
) {
  const totals = recalculateTotals(updatedItems, currentTotals.tax, currentTotals.paid);
  dispatch(updateItems(updatedItems));
  dispatch(updateTotals(totals));
}

export function useInvoiceItemHandlers({
  location,
  invoiceId,
  invoiceDetail,
  dispatch,
}: UseInvoiceItemHandlersProps) {
  const handleSaveItem = React.useCallback(
    async (updatedItem: InvoiceItem) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }
      try {
        const itemExists = invoiceDetail.items.some((item) => item.id === updatedItem.id);
        let normalizedItem = updatedItem;

        if (!itemExists) {
          const parsedItemId = Number(String(updatedItem.id).split("-")[0]);
          if (Number.isNaN(parsedItemId)) {
            toast.error("Invalid item selected");
            return;
          }

          const addLineItemResponse = await addInvoiceLineItem(location, invoiceId, {
            itemId: parsedItemId,
          });

          if (!addLineItemResponse?.success) {
            toast.error(addLineItemResponse?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
            return;
          }

          normalizedItem = {
            ...updatedItem,
            id: String(addLineItemResponse.data.id),
          };
        } else {
          const lineItemId = Number(updatedItem.id);
          if (Number.isNaN(lineItemId)) {
            toast.error("Invalid line item id");
            return;
          }

          const unit = Number(updatedItem.qty || 0);
          const amount = Number(
            updatedItem.unitPrice !== undefined
              ? updatedItem.unitPrice
              : unit > 0
                ? updatedItem.price / unit
                : updatedItem.price
          );

          const updateLineItemResponse = await updateInvoiceLineItem(location, lineItemId, {
            description: updatedItem.description || "",
            amount,
            unit,
            cost: Number(updatedItem.cost || 0),
            royaltyFree: updatedItem.royalty === "Yes" ? 1 : 0,
          });

          if (!updateLineItemResponse?.success) {
            toast.error(updateLineItemResponse?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
            return;
          }
        }

        const updatedItems = itemExists
          ? invoiceDetail.items.map((item) =>
              item.id === normalizedItem.id ? normalizedItem : item
            )
          : [...invoiceDetail.items, normalizedItem];

        applyItemUpdate(dispatch, updatedItems, invoiceDetail.totals);
        toast.success(
          itemExists
            ? TOAST_MESSAGES.SUCCESS.ITEM_UPDATED
            : "Line item added successfully"
        );
      } catch (error) {
        console.error("Failed to save item:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch, location, invoiceId]
  );

  const handleDeleteItem = React.useCallback(
    async (itemId: string) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }
      try {
        const lineItemId = Number(itemId);
        if (Number.isNaN(lineItemId)) {
          toast.error("Invalid line item id");
          return;
        }

        const deleteLineItemResponse = await deleteInvoiceLineItem(location, lineItemId);
        if (!deleteLineItemResponse?.success) {
          toast.error(deleteLineItemResponse?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
          return;
        }

        const updatedItems = invoiceDetail.items.filter((item) => item.id !== itemId);
        applyItemUpdate(dispatch, updatedItems, invoiceDetail.totals);
        toast.success(TOAST_MESSAGES.SUCCESS.ITEM_DELETED);
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch, location]
  );

  return {
    handleSaveItem,
    handleDeleteItem,
  };
}

