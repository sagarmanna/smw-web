"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchInvoice,
  clearCache,
  updateInvoiceDetail,
  updateCustomer,
  updateItems,
  updateTotals,
  updateMessage,
  addComment,
  addHistoryEntry,
} from "../[id]/invoices-details.slice";
import { InvoiceDetail, InvoiceItem, InvoiceComment, InvoiceStatus } from "../mockData/invoiceDetailMockData";
import { useInvoiceItemHandlers } from "./useInvoiceItemHandlers";
import { useInvoiceDiscountHandlers } from "./useInvoiceDiscountHandlers";
import { useInvoiceDetailsHandlers } from "./useInvoiceDetailsHandlers";
import { useInvoiceCustomerHandlers } from "./useInvoiceCustomerHandlers";
import { useInvoiceReturnHandlers } from "./useInvoiceReturnHandlers";
import { useInvoiceTaxHandlers } from "./useInvoiceTaxHandlers";
import { useInvoiceMessageHandlers } from "./useInvoiceMessageHandlers";
import { useInvoiceCommentsHandlers } from "./useInvoiceCommentsHandlers";
import { useInvoiceVoidHandlers } from "./useInvoiceVoidHandlers";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";
import { TaxAdjustmentData } from "../components/modals/AdjustTaxModal";
import { DISCOUNT_WARNING_DURATION, TOAST_MESSAGES } from "../utils/constants";

type InvoiceDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  invoiceDetail: InvoiceDetail | null;
  refresh: () => Promise<void>;
  handleSaveDetails: (updatedInvoice: Partial<InvoiceDetail>) => Promise<boolean>;
  handleCustomerChange: (customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  }) => void;
  handleSaveDiscount: (selectedItemIds: string[], discountData: DiscountData) => void;
  handleSaveItem: (updatedItem: InvoiceItem) => void;
  handleDeleteItem: (itemId: string) => void;
  handleAdjustTax: (adjustmentData: TaxAdjustmentData) => void;
  handleSaveMessage: (message: string) => void;
  handleAddComment: (content: string) => Promise<void>;
  handleReturnConfirm: () => void;
  isReturning: boolean;
  handleVoidConfirm: () => void;
  isVoiding: boolean;
  showDiscountWarning: boolean;
  setShowDiscountWarning: (show: boolean) => void;
};

export function useInvoiceDetails(
  location: string,
  invoiceId: number
): InvoiceDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get invoice data from Redux store
  const invoiceDetail = useAppSelector((state) => state.invoice.invoiceDetail);
  const isLoading = useAppSelector((state) => state.invoice.isLoading);
  const error = useAppSelector((state) => state.invoice.error);
  
  const [showDiscountWarning, setShowDiscountWarning] = React.useState(false);

  // Auto-dismiss discount warning banner after configured duration
  React.useEffect(() => {
    if (showDiscountWarning) {
      const timer = setTimeout(() => {
        setShowDiscountWarning(false);
      }, DISCOUNT_WARNING_DURATION);

      return () => clearTimeout(timer);
    }
  }, [showDiscountWarning]);

  // Use reusable hooks for all handlers - now they use Redux dispatch
  const { handleSaveDetails } = useInvoiceDetailsHandlers({
    invoiceDetail,
    dispatch,
    location,
    invoiceId,
  });

  const { handleCustomerChange } = useInvoiceCustomerHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleSaveDiscount } = useInvoiceDiscountHandlers({
    invoiceDetail,
    dispatch,
    onDiscountWarning: setShowDiscountWarning,
  });

  const { handleSaveItem, handleDeleteItem } = useInvoiceItemHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleAdjustTax } = useInvoiceTaxHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleSaveMessage } = useInvoiceMessageHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleAddComment } = useInvoiceCommentsHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleReturnConfirm, isReturning } = useInvoiceReturnHandlers({
    invoiceDetail,
    dispatch,
  });

  const { handleVoidConfirm, isVoiding } = useInvoiceVoidHandlers({
    invoiceDetail,
    dispatch,
  });

  const refresh = React.useCallback(async () => {
    dispatch(clearCache());
    await dispatch(fetchInvoice({ location, invoiceId })).unwrap();
  }, [dispatch, location, invoiceId]);

  return {
    loading: isLoading,
    error,
    invoiceDetail,
    refresh,
    handleSaveDetails,
    handleCustomerChange,
    handleSaveDiscount,
    handleSaveItem,
    handleDeleteItem,
    handleAdjustTax,
    handleSaveMessage,
    handleAddComment,
    handleReturnConfirm,
    isReturning,
    handleVoidConfirm,
    isVoiding,
    showDiscountWarning,
    setShowDiscountWarning,
  };
}
