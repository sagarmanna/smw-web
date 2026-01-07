"use client";

import * as React from "react";
import { getMockInvoiceDetail, InvoiceDetail } from "../mockData/invoiceDetailMockData";
import { useInvoiceItemHandlers } from "./useInvoiceItemHandlers";
import { useInvoiceDiscountHandlers } from "./useInvoiceDiscountHandlers";
import { useInvoiceDetailsHandlers } from "./useInvoiceDetailsHandlers";
import { useInvoiceCustomerHandlers } from "./useInvoiceCustomerHandlers";
import { useInvoiceReturnHandlers } from "./useInvoiceReturnHandlers";
import { InvoiceItem } from "../mockData/invoiceDetailMockData";
import { DiscountData } from "../components/modals/InvoiceDiscountModal";

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
  handleReturnConfirm: () => void;
  isReturning: boolean;
  showDiscountWarning: boolean;
  setShowDiscountWarning: (show: boolean) => void;
};

export function useInvoiceDetails(
  location: string,
  invoiceId: number
): InvoiceDetailsHookReturn {
  const [invoiceDetail, setInvoiceDetail] = React.useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showDiscountWarning, setShowDiscountWarning] = React.useState(false);

  // Fetch invoice details
  const fetchInvoiceDetail = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 300));
      const detail = getMockInvoiceDetail(invoiceId);
      if (detail) {
        setInvoiceDetail(detail);
      } else {
        setError("Invoice not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  // Initial fetch
  React.useEffect(() => {
    fetchInvoiceDetail();
  }, [fetchInvoiceDetail]);

  // Auto-dismiss discount warning banner after 15 seconds
  React.useEffect(() => {
    if (showDiscountWarning) {
      const timer = setTimeout(() => {
        setShowDiscountWarning(false);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [showDiscountWarning]);

  // Use reusable hooks for all handlers
  const { handleSaveDetails } = useInvoiceDetailsHandlers({
    invoiceDetail,
    updateInvoiceDetail: setInvoiceDetail,
  });

  const { handleCustomerChange } = useInvoiceCustomerHandlers({
    invoiceDetail,
    updateInvoiceDetail: setInvoiceDetail,
  });

  const { handleSaveDiscount } = useInvoiceDiscountHandlers({
    invoiceDetail,
    updateInvoiceDetail: setInvoiceDetail,
    onDiscountWarning: setShowDiscountWarning,
  });

  const { handleSaveItem, handleDeleteItem } = useInvoiceItemHandlers({
    invoiceDetail,
    updateInvoiceDetail: setInvoiceDetail,
  });

  const { handleReturnConfirm, isReturning } = useInvoiceReturnHandlers({
    invoiceDetail,
    updateInvoiceDetail: setInvoiceDetail,
  });

  const refresh = React.useCallback(async () => {
    await fetchInvoiceDetail();
  }, [fetchInvoiceDetail]);

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
    handleReturnConfirm,
    isReturning,
    showDiscountWarning,
    setShowDiscountWarning,
  };
}

