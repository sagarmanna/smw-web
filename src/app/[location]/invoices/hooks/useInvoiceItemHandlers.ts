"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceItem, InvoiceDetail } from "../types";
import { fetchInvoice, updateItems, updateTotals } from "../[id]/invoices-details.slice";
import {
  addInvoiceLineItem,
  deleteInvoiceLineItem,
  editInvoiceItemsTax,
  getInvoiceItemsTaxEditConfig,
  type InvoiceItemsTaxEditConfigData,
  updateInvoiceLineItem,
} from "../[id]/invoices-details.api";
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
  const totals = recalculateTotals(updatedItems, currentTotals.paid);
  dispatch(updateItems(updatedItems));
  dispatch(updateTotals(totals));
}

function extractLineItemIds(selectedItemIds: string[]): number[] {
  const parsedIds = new Set<number>();

  selectedItemIds.forEach((rawValue) => {
    String(rawValue)
      .split(",")
      .forEach((chunk) => {
        const normalized = chunk.trim().split("-")[0];
        const numericId = Number(normalized);
        if (!Number.isNaN(numericId) && numericId > 0) {
          parsedIds.add(numericId);
        }
      });
  });

  return Array.from(parsedIds);
}

export function useInvoiceItemHandlers({
  location,
  invoiceId,
  invoiceDetail,
  dispatch,
}: UseInvoiceItemHandlersProps) {
  const handleLoadItemTaxOptions = React.useCallback(
    async (
      selectedItemIds: string[]
    ): Promise<InvoiceItemsTaxEditConfigData | null> => {
      const lineItemIds = extractLineItemIds(selectedItemIds);

      if (lineItemIds.length === 0) {
        return null;
      }

      try {
        const response = await getInvoiceItemsTaxEditConfig(location, lineItemIds);
        if (!response?.success) {
          toast.error(response?.message || "Failed to load item tax options");
          return null;
        }

        return {
          currentTaxStatus: response.data.currentTaxStatus,
          currentTaxRate: Number(response.data.currentTaxRate ?? 0) || 0,
          availableTaxStatuses: response.data.availableTaxStatuses
            .map((status) => ({
              id: Number(status.id),
              name: status.name,
              rate: Number(status.rate ?? 0) || 0,
            }))
            .filter((status) => status.name.length > 0),
        };
      } catch (error) {
        console.error("Failed to load item tax options:", error);
        toast.error("Failed to load item tax options");
        return null;
      }
    },
    [location]
  );

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

  const handleSaveItemTax = React.useCallback(
    async (
      selectedItemIds: string[],
      taxStatus: string
    ): Promise<{ success: boolean; taxRate: number }> => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return { success: false, taxRate: 0 };
      }

      const lineItemIds = extractLineItemIds(selectedItemIds);

      if (lineItemIds.length === 0) {
        toast.error("No valid line items selected");
        return { success: false, taxRate: 0 };
      }

      try {
        const response = await editInvoiceItemsTax(location, {
          lineItemIds,
          taxStatus,
        });

        if (!response?.success) {
          toast.error(response?.message || "Failed to update item tax");
          return { success: false, taxRate: 0 };
        }

        const taxRatePercent = Number(response.data?.taxRate ?? 0);
        const taxMultiplier = Number.isFinite(taxRatePercent) ? taxRatePercent / 100 : 0;
        const selectedSet = new Set(lineItemIds);

        const updatedItems = invoiceDetail.items.map((item) => {
          const normalizedItemId = Number(String(item.id).split("-")[0]);
          if (!selectedSet.has(normalizedItemId)) return item;

          const qty = Number(item.qty || 0);
          const unitPrice = Number(item.unitPrice || 0);
          const baseLineAmount = qty > 0 && unitPrice > 0
            ? unitPrice * qty
            : Number(item.price || 0);

          return {
            ...item,
            taxStatus,
            tax: Number((baseLineAmount * taxMultiplier).toFixed(2)),
          };
        });

        applyItemUpdate(dispatch, updatedItems, invoiceDetail.totals);
        // Keep the UI in sync with server-calculated values after save.
        await dispatch(fetchInvoice({ location, invoiceId })).unwrap();
        toast.success(response.message || "Tax updated successfully");

        return { success: true, taxRate: taxRatePercent };
      } catch (error) {
        console.error("Failed to update item tax:", error);
        toast.error("Failed to update item tax");
        return { success: false, taxRate: 0 };
      }
    },
    [invoiceDetail, dispatch, location]
  );

  return {
    handleSaveItem,
    handleDeleteItem,
    handleSaveItemTax,
    handleLoadItemTaxOptions,
  };
}

