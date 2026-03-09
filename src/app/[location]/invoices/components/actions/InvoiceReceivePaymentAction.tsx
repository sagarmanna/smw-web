"use client";

import * as React from "react";
import { toast } from "sonner";
import { ReceivePaymentModal, type ReceivePaymentData } from "@/components/modal/ReceivePaymentModal";
import { PaymentReceiptModalContainer, getPaymentReceiptData } from "@/components/modal/PaymentReceiptModal";
import { getCustomerPayments } from "@/app/[location]/customers/customers.api";

type DirectPaymentReceiptData = {
  date: string;
  paymentMethod: string;
  reference: string;
  amount: number;
  lessons?: Array<{ date: string; student: string; program: string; teacher: string; amount: string; payment: string; balance: string }>;
  groupLessons?: Array<{ date: string; student: string; program: string; amount: string; balance: string }>;
  invoices?: Array<{ date: string; number: string; amount: string; payment: string; balance: string }>;
  credits?: Array<{ type: string; reference: string; paymentMethod?: string; amount: string; amountUsed: string }>;
};

interface InvoiceReceivePaymentActionProps {
  location: string;
  customerId: number | null;
  customerName: string;
  onPaymentSaved?: () => Promise<void> | void;
  openRequestKey?: number;
  children?: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

export function InvoiceReceivePaymentAction({
  location,
  customerId,
  customerName,
  onPaymentSaved,
  openRequestKey,
  children,
}: InvoiceReceivePaymentActionProps) {
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [directPaymentReceiptData, setDirectPaymentReceiptData] = React.useState<DirectPaymentReceiptData | null>(null);

  const handleOpenReceivePayment = React.useCallback(() => {
    if (!customerId) {
      toast.error("Customer ID is required to receive payment");
      return;
    }
    setIsReceivePaymentModalOpen(true);
  }, [customerId]);

  React.useEffect(() => {
    if (typeof openRequestKey === "number" && openRequestKey > 0) {
      handleOpenReceivePayment();
    }
  }, [openRequestKey, handleOpenReceivePayment]);

  const handleReceivePayment = React.useCallback(
    async (paymentData: ReceivePaymentData) => {
      if (!customerId) {
        toast.error("Customer ID is required to receive payment");
        return;
      }

      try {
        const { receivePayment } = await import("@/lib/api/legacyApiAdapter");
        const paymentMethodId = Number(paymentData.paymentMethod) || 1;
        const formatToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

        const lessonPaymentsTotal = Object.values(paymentData.lessonPayments || {}).reduce((sum, val) => sum + val, 0);
        const groupLessonPaymentsTotal = Object.values(paymentData.groupLessonPayments || {}).reduce((sum, val) => sum + val, 0);
        const invoicePaymentsTotal = Object.values(paymentData.invoicePayments || {}).reduce((sum, val) => sum + val, 0);
        const amountNeeded = formatToTwoDecimals(lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal);
        const amountToDistribute = formatToTwoDecimals(amountNeeded);

        const lessonPaymentsArray =
          paymentData.lessonPayments &&
          Object.entries(paymentData.lessonPayments)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
            .filter(({ id }) => !isNaN(id) && id > 0);
        const groupLessonPaymentsArray =
          paymentData.groupLessonPayments &&
          Object.entries(paymentData.groupLessonPayments)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
            .filter(({ id }) => !isNaN(id) && id > 0);
        const invoicePaymentsArray =
          paymentData.invoicePayments &&
          Object.entries(paymentData.invoicePayments)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
            .filter(({ id }) => !isNaN(id) && id > 0);
        const paymentCreditsArray =
          paymentData.paymentCredits &&
          Object.entries(paymentData.paymentCredits)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
            .filter(({ id }) => !isNaN(id) && id > 0);
        const invoiceCreditsArray =
          paymentData.invoiceCredits &&
          Object.entries(paymentData.invoiceCredits)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
            .filter(({ id }) => !isNaN(id) && id > 0);

        const selectedCreditValue = formatToTwoDecimals(
          (paymentCreditsArray?.reduce((sum, credit) => sum + credit.value, 0) ?? 0) +
            (invoiceCreditsArray?.reduce((sum, credit) => sum + credit.value, 0) ?? 0)
        );
        const amountAfterCredits = amountNeeded - selectedCreditValue;
        const calculatedAmount =
          amountAfterCredits < 0 ? (amountNeeded > 0 ? 0 : amountAfterCredits) : amountAfterCredits;
        const finalAmount =
          selectedCreditValue > 0 ? formatToTwoDecimals(calculatedAmount) : formatToTwoDecimals(paymentData.amountReceived);

        const legacyPaymentData = {
          userId: customerId,
          date: paymentData.date,
          paymentMethodId,
          reference: paymentData.reference || "",
          amount: finalAmount,
          amountNeeded,
          selectedCreditValue,
          amountToDistribute,
          notes: paymentData.notes || "",
          lessonPayments: lessonPaymentsArray && lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
          groupLessonPayments:
            groupLessonPaymentsArray && groupLessonPaymentsArray.length > 0 ? groupLessonPaymentsArray : undefined,
          invoicePayments: invoicePaymentsArray && invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
          paymentCredits: paymentCreditsArray && paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
          invoiceCredits: invoiceCreditsArray && invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
          canUsePaymentCredits: paymentCreditsArray && paymentCreditsArray.length > 0 ? 1 : 0,
          canUseInvoiceCredits: invoiceCreditsArray && invoiceCreditsArray.length > 0 ? 1 : 0,
          prId: "",
        };

        const response = await receivePayment(location, legacyPaymentData);
        if (!response.status) {
          toast.error(response.message ?? "Failed to receive payment");
          return;
        }

        setIsReceivePaymentModalOpen(false);
        toast.success(`Payment of $${finalAmount.toFixed(2)} received successfully`);
        await onPaymentSaved?.();

        try {
          const paymentsResponse = await getCustomerPayments(location, customerId, 1, 1);
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0] as { id?: number | string };
            const paymentId = latestPayment.id;
            if (paymentId != null) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              const receiptData = await getPaymentReceiptData(location, paymentId);

              const directData = {
                date: receiptData.info?.date ?? paymentData.date,
                paymentMethod: receiptData.info?.paymentMethod ?? "",
                reference: receiptData.info?.reference ?? paymentData.reference ?? "",
                amount: receiptData.info?.amount ?? finalAmount,
                lessons: receiptData.lessons.data.map((lesson) => ({
                  date: lesson.date,
                  student: lesson.student,
                  program: lesson.program,
                  teacher: lesson.teacher,
                  amount: lesson.amount,
                  payment: lesson.payment,
                  balance: lesson.balance ?? "$0.00",
                })),
                groupLessons: receiptData.groupLessons.data.map((groupLesson) => ({
                  date: groupLesson.date,
                  student: groupLesson.student,
                  program: groupLesson.program,
                  amount: groupLesson.amount,
                  balance: groupLesson.balance ?? "$0.00",
                })),
                invoices: receiptData.invoices.data.map((invoice) => ({
                  date: invoice.date,
                  number: invoice.number,
                  amount: invoice.amount,
                  payment: invoice.payment,
                  balance: invoice.balance ?? "$0.00",
                })),
              };

              setDirectPaymentReceiptData(directData);
              setIsReceiptModalOpen(true);
            }
          }
        } catch (receiptError) {
          console.error("Error fetching payment receipt data:", receiptError);
        }
      } catch (error) {
        console.error("Error receiving payment:", error);
        toast.error(error instanceof Error ? error.message : "Failed to receive payment");
      }
    },
    [customerId, location, onPaymentSaved]
  );

  return (
    <>
      {children ? children({ onClick: handleOpenReceivePayment, disabled: !customerId }) : null}

      {customerId && (
        <ReceivePaymentModal
          open={isReceivePaymentModalOpen}
          onOpenChange={setIsReceivePaymentModalOpen}
          onSave={handleReceivePayment}
          location={location}
          customerId={customerId.toString()}
          customerName={customerName}
        />
      )}

      {customerId && directPaymentReceiptData && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={(open) => {
            setIsReceiptModalOpen(open);
            if (!open) {
              setDirectPaymentReceiptData(null);
            }
          }}
          location={location}
          customerId={customerId}
          customerName={customerName}
          mode="new"
          directPaymentData={directPaymentReceiptData}
        />
      )}
    </>
  );
}
