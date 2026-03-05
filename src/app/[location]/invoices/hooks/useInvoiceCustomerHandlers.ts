"use client";

import * as React from "react";
import { toast } from "sonner";
import { AppDispatch } from "@/redux/store";
import { assignInvoiceCustomer } from "../[id]/invoices-details.api";
import type { InvoiceDetail } from "../types";
import { updateCustomer } from "../[id]/invoices-details.slice";
import { TOAST_MESSAGES } from "../utils/constants";

interface UseInvoiceCustomerHandlersProps {
  invoiceDetail: InvoiceDetail | null;
  dispatch: AppDispatch;
  location: string;
  invoiceId: number;
}

export function useInvoiceCustomerHandlers({
  invoiceDetail,
  dispatch,
  location,
  invoiceId,
}: UseInvoiceCustomerHandlersProps) {
  const applyCustomerUpdate = React.useCallback(
    (
      customer: {
        name: string;
        phone: string;
        email: string;
        customerId?: number;
        type?: 1 | 2;
      },
      message?: string
    ) => {
      dispatch(updateCustomer(customer));
      toast.success(message || TOAST_MESSAGES.SUCCESS.CUSTOMER_UPDATED);
    },
    [dispatch]
  );

  const handleCustomerChange = React.useCallback(
    (customer: {
      name: string;
      phone: string;
      email: string;
      customerId?: number;
      type?: 1 | 2;
    }) => {
      if (!invoiceDetail) {
        toast.error(TOAST_MESSAGES.ERROR.INVOICE_NOT_FOUND);
        return;
      }

      const persistExistingCustomer = customer.type === 1 && Number(customer.customerId) > 0;

      if (!persistExistingCustomer) {
        try {
          applyCustomerUpdate({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            customerId: customer.customerId,
            type: customer.type,
          });
        } catch (error) {
          console.error("Failed to update customer:", error);
          toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
        }
        return;
      }

      void (async () => {
        try {
          const response = await assignInvoiceCustomer(location, invoiceId, {
            customerId: Number(customer.customerId),
          });

          if (!response?.success) {
            toast.error(response?.message || TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
            return;
          }

          const hasResponseData = Boolean(response.data);
          const responseType = Number(response.data?.type);
          const normalizedType = responseType === 1 ? 1 : responseType === 2 ? 2 : customer.type;

          applyCustomerUpdate({
            name: hasResponseData ? (response.data?.customerName ?? customer.name) : customer.name,
            phone: hasResponseData ? (response.data?.phoneNumber ?? "") : customer.phone,
            email: hasResponseData ? (response.data?.email ?? "") : customer.email,
            customerId: hasResponseData ? (response.data?.customerId ?? customer.customerId) : customer.customerId,
            type: normalizedType,
          }, response.message);
        } catch (error) {
          console.error("Failed to update customer:", error);
          toast.error(TOAST_MESSAGES.ERROR.FAILED_TO_SAVE);
        }
      })();
    },
    [invoiceDetail, applyCustomerUpdate, invoiceId, location]
  );

  return {
    handleCustomerChange,
  };
}

