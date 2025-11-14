// components/PaymentReceipt.tsx
"use client";

import * as React from "react";
import { ReceivePaymentModal } from "@/app/[location]/customers/components/ReceivePaymentModal";
import { ReceivePaymentData } from "@/app/[location]/customers/components/ReceivePaymentModal/types";
import { receivePayment, PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

interface PaymentsReceivePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  paymentId?: string;
  onSaveSuccess?: () => void;
}

export function PaymentsReceivePaymentModal({
  open,
  onOpenChange,
  location,
  paymentId,
  onSaveSuccess,
}: PaymentsReceivePaymentModalProps) {
  const handleSavePayment = React.useCallback(
    async (paymentData: ReceivePaymentData) => {
      // Validate customer ID
      const customerIdNum = Number(paymentData.customer);

      if (
        !paymentData.customer ||
        paymentData.customer === "0" ||
        isNaN(customerIdNum) ||
        customerIdNum <= 0
      ) {
        toast.error("Please select a customer");
        return;
      }
      try {
        const formatToTwoDecimals = (value: number) =>
          Math.round(value * 100) / 100;

        const lessonTotal = Object.values(
          paymentData.lessonPayments || {}
        ).reduce((sum, val) => sum + val, 0);
        const groupLessonTotal = Object.values(
          paymentData.groupLessonPayments || {}
        ).reduce((sum, val) => sum + val, 0);
        const invoiceTotal = Object.values(
          paymentData.invoicePayments || {}
        ).reduce((sum, val) => sum + val, 0);
        const amountNeeded = formatToTwoDecimals(
          lessonTotal + groupLessonTotal + invoiceTotal
        );

        const buildPaymentArray = (payments: Record<string, number> = {}) =>
          Object.entries(payments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0);

        const lessonPaymentsArray = buildPaymentArray(
          paymentData.lessonPayments
        );
        const groupLessonPaymentsArray = buildPaymentArray(
          paymentData.groupLessonPayments
        );
        const invoicePaymentsArray = buildPaymentArray(
          paymentData.invoicePayments
        );
        const paymentCreditsArray = buildPaymentArray(
          paymentData.paymentCredits
        );
        const invoiceCreditsArray = buildPaymentArray(
          paymentData.invoiceCredits
        );

        const selectedCreditValue = formatToTwoDecimals(
          paymentCreditsArray.reduce((sum, c) => sum + c.value, 0) +
            invoiceCreditsArray.reduce((sum, c) => sum + c.value, 0)
        );

        const amountAfterCredits = amountNeeded - selectedCreditValue;
        const calculatedAmount =
          amountAfterCredits < 0
            ? amountNeeded > 0
              ? 0.0
              : amountAfterCredits
            : amountAfterCredits;

        const finalAmount =
          selectedCreditValue > 0
            ? formatToTwoDecimals(calculatedAmount)
            : formatToTwoDecimals(paymentData.amountReceived);

        const legacyPaymentData: PaymentReceiveData = {
          userId: customerIdNum,
          date: paymentData.date,
          paymentMethodId: Number(paymentData.paymentMethod) || 1,
          reference: paymentData.reference || "",
          amount: finalAmount,
          amountNeeded,
          selectedCreditValue,
          amountToDistribute: formatToTwoDecimals(amountNeeded),
          notes: paymentData.notes || "",
          lessonPayments:
            lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
          groupLessonPayments:
            groupLessonPaymentsArray.length > 0
              ? groupLessonPaymentsArray
              : undefined,
          invoicePayments:
            invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
          paymentCredits:
            paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
          invoiceCredits:
            invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
          canUsePaymentCredits: paymentCreditsArray.length > 0 ? 1 : 0,
          canUseInvoiceCredits: invoiceCreditsArray.length > 0 ? 1 : 0,
          prId: paymentId || "",
        };
        const response = await receivePayment(location, legacyPaymentData);

        if (response.status) {
          toast.success("Payment saved successfully");
          onOpenChange(false);
          onSaveSuccess?.();
        } else {
          toast.error(
            response.message ||
              response.errors?.join(", ") ||
              "Failed to save payment"
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save payment"
        );
      }
    },
    [location, paymentId, onOpenChange, onSaveSuccess]
  );

  return (
    <ReceivePaymentModal
      open={open}
      onOpenChange={onOpenChange}
      onSave={handleSavePayment}
      location={location}
      customerId="0"
    />
  );
}
