"use client";

import * as React from "react";
import { toast } from "sonner";
import { InvoiceDetail } from "../mockData/invoiceDetailMockData";

interface UseInvoiceCustomerHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  updateInvoiceDetail: (updater: (prev: InvoiceDetail | null) => InvoiceDetail | null) => void;
}

export function useInvoiceCustomerHandlers({
  invoiceDetail,
  updateInvoiceDetail,
}: UseInvoiceCustomerHandlersProps) {
  const handleCustomerChange = React.useCallback(
    (customer: {
      name: string;
      phone: string;
      email: string;
      customerId?: number;
    }) => {
      if (!invoiceDetail) return;

      updateInvoiceDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          customer: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            customerId: customer.customerId,
          },
        };
      });

      toast.success("Customer updated successfully");
    },
    [invoiceDetail, updateInvoiceDetail]
  );

  return {
    handleCustomerChange,
  };
}

