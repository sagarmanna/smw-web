"use client";

import * as React from "react";
import { toast } from "sonner";
import { ReceivePaymentModal, type ReceivePaymentData } from "@/components/modal/ReceivePaymentModal";
import { PaymentReceiptModalContainer } from "@/components/modal/PaymentReceiptModal";
import { getCustomerInfo, getCustomerPayments } from "@/app/[location]/customers/customers.api";
import { formatCurrency } from "@/utils/formatCurrency";

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
  customerEmail?: string;
  customerPhone?: string;
  onPaymentSaved?: () => Promise<void> | void;
  openRequestKey?: number;
  children?: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

export function InvoiceReceivePaymentAction({
  location,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  onPaymentSaved,
  openRequestKey,
  children,
}: InvoiceReceivePaymentActionProps) {
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<number | string | null>(null);
  const [directPaymentReceiptData, setDirectPaymentReceiptData] = React.useState<DirectPaymentReceiptData | null>(null);
  const [receiptCustomerName, setReceiptCustomerName] = React.useState(customerName || "");
  const [receiptCustomerEmail, setReceiptCustomerEmail] = React.useState(customerEmail || "");
  const [receiptCustomerPhone, setReceiptCustomerPhone] = React.useState(customerPhone || "");

  React.useEffect(() => {
    setReceiptCustomerName(customerName || "");
  }, [customerName]);

  React.useEffect(() => {
    setReceiptCustomerEmail(customerEmail || "");
  }, [customerEmail]);

  React.useEffect(() => {
    setReceiptCustomerPhone(customerPhone || "");
  }, [customerPhone]);

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

  const handleReceiptModalOpenChange = React.useCallback((open: boolean) => {
    setIsReceiptModalOpen(open);
    if (!open) {
      setSelectedPaymentId(null);
      setDirectPaymentReceiptData(null);
    }
  }, []);

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
          const customerInfo = await getCustomerInfo(location, customerId);
          if (customerInfo?.success && customerInfo.data) {
            const profile = customerInfo.data.profile;
            const emails = customerInfo.data.email || [];
            const phones = customerInfo.data.phone || [];
            const primaryEmail = emails.find((email) => email.isPrimary) || emails[0];
            const primaryPhone = phones.find((phone) => phone.isPrimary) || phones[0];

            setReceiptCustomerName(profile?.name || customerName || `Customer ${customerId}`);
            setReceiptCustomerEmail(primaryEmail?.email || customerEmail || "");
            setReceiptCustomerPhone(primaryPhone?.number || customerPhone || "");
          }
        } catch (customerInfoError) {
          console.error("Error fetching customer info:", customerInfoError);
        }

        const paymentMethodName = paymentData.paymentMethodName || paymentData.paymentMethod;
        const credits: Array<{
          type: string;
          reference: string;
          paymentMethod?: string;
          amount: string;
          amountUsed: string;
        }> = [];

        const creditDetailsMap = new Map<string, { id: string; reference: string; payment: string; type: string }>();
        if (paymentData.creditDetails && Array.isArray(paymentData.creditDetails)) {
          paymentData.creditDetails.forEach((credit) => {
            creditDetailsMap.set(credit.id, credit);
          });
        }

        if (paymentData.invoiceCredits && Object.keys(paymentData.invoiceCredits).length > 0) {
          Object.entries(paymentData.invoiceCredits).forEach(([creditId, amount]) => {
            const creditDetail = creditDetailsMap.get(creditId);
            const invoiceRef = creditDetail?.reference || (creditId.startsWith("I-") ? creditId : `I-${creditId}`);
            credits.push({
              type: "Invoice Credit",
              reference: invoiceRef,
              paymentMethod: "",
              amount: "$0.00",
              amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount),
            });
          });
        }

        if (paymentData.paymentCredits && Object.keys(paymentData.paymentCredits).length > 0) {
          Object.entries(paymentData.paymentCredits).forEach(([creditId, amount]) => {
            const creditDetail = creditDetailsMap.get(creditId);
            credits.push({
              type: "Payment Credit",
              reference: "",
              paymentMethod: paymentData.paymentMethodName || "",
              amount: formatCurrency(amount),
              amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount),
            });
          });
        }

        const fallbackDirectData: DirectPaymentReceiptData = {
          date: paymentData.date,
          paymentMethod: paymentMethodName,
          reference: paymentData.reference || "",
          amount: finalAmount,
          credits: credits.length > 0 ? credits : undefined,
        };

        try {
          const paymentsResponse = await getCustomerPayments(location, customerId, 1, 1, "id");
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0] as { id?: number | string };
            const paymentId = latestPayment.id;
            if (paymentId != null) {
              setSelectedPaymentId(paymentId);
              setDirectPaymentReceiptData(null);
              setIsReceiptModalOpen(true);
            } else {
              setSelectedPaymentId(null);
              setDirectPaymentReceiptData(fallbackDirectData);
              setIsReceiptModalOpen(true);
            }
          } else {
            setSelectedPaymentId(null);
            setDirectPaymentReceiptData(fallbackDirectData);
            setIsReceiptModalOpen(true);
          }
        } catch (receiptError) {
          console.error("Error fetching payment receipt data:", receiptError);
          setSelectedPaymentId(null);
          setDirectPaymentReceiptData(fallbackDirectData);
          setIsReceiptModalOpen(true);
        }
      } catch (error) {
        console.error("Error receiving payment:", error);
        toast.error(error instanceof Error ? error.message : "Failed to receive payment");
      }
    },
    [customerEmail, customerId, customerName, customerPhone, location, onPaymentSaved]
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

      {customerId && selectedPaymentId != null && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={handleReceiptModalOpenChange}
          location={location}
          customerId={customerId}
          paymentId={selectedPaymentId}
          customerName={receiptCustomerName}
          customerEmail={receiptCustomerEmail}
          customerPhone={receiptCustomerPhone}
          mode="view"
          onEdit={() => {
            void onPaymentSaved?.();
          }}
          onDelete={() => {
            void onPaymentSaved?.();
          }}
        />
      )}

      {customerId && directPaymentReceiptData && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={handleReceiptModalOpenChange}
          location={location}
          customerId={customerId}
          customerName={receiptCustomerName}
          customerEmail={receiptCustomerEmail}
          customerPhone={receiptCustomerPhone}
          mode="new"
          directPaymentData={directPaymentReceiptData}
          onEdit={() => {
            void onPaymentSaved?.();
          }}
          onDelete={() => {
            void onPaymentSaved?.();
          }}
        />
      )}
    </>
  );
}
