"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import type { InvoiceDetail } from "../types";
import { updateCustomer } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceCustomerHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
}

export function useInvoiceCustomerHandlers({
  invoiceDetail,
  dispatch,
}: UseInvoiceCustomerHandlersProps) {
  const handleCustomerChange = React.useCallback(
    (customer: {
      name: string;
      phone: string;
      email: string;
      customerId?: number;
    }) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      try {
        // Update Redux state
        dispatch(updateCustomer({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          customerId: customer.customerId,
        }));

        toast.success(TOAST_MESSAGES.SUCCESS.CUSTOMER_UPDATED);
      } catch (error) {
        console.error("Failed to update customer:", error);
        toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
      }
    },
    [invoiceDetail, dispatch]
  );

  return {
    handleCustomerChange,
  };
}

