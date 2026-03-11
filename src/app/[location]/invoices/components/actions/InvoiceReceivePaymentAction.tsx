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
  const [receiptPaymentData, setReceiptPaymentData] = React.useState<ReceivePaymentData | null>(null);
  const [directPaymentReceiptData, setDirectPaymentReceiptData] = React.useState<DirectPaymentReceiptData | null>(null);
  const lastHandledOpenRequestKeyRef = React.useRef(openRequestKey ?? 0);
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
    if (
      typeof openRequestKey === "number" &&
      openRequestKey > 0 &&
      openRequestKey > lastHandledOpenRequestKeyRef.current
    ) {
      lastHandledOpenRequestKeyRef.current = openRequestKey;
      handleOpenReceivePayment();
    }
  }, [openRequestKey, handleOpenReceivePayment]);

  const shouldRenderReceiptModal = customerId && (directPaymentReceiptData || receiptPaymentData);

  const handleReceiptModalOpenChange = React.useCallback((open: boolean) => {
    setIsReceiptModalOpen(open);
    if (!open) {
      setReceiptPaymentData(null);
      setDirectPaymentReceiptData(null);
    }
  }, []);

  const transformedReceiptData = React.useMemo<DirectPaymentReceiptData | undefined>(() => {
    if (!receiptPaymentData) return undefined;

    const paymentMethodNames: Record<string, string> = {
      "1": "Cash",
      "2": "Credit Card",
      "3": "Preauthorized",
      "4": "Cheque",
      "5": "Debit",
      "6": "E-Transfer",
      "7": "Gift Card",
      "8": "Account Entry",
    };

    const formatCurrencyAmount = (amount: number): string => formatCurrency(amount);
    const paymentMethodName =
      receiptPaymentData.paymentMethodName ||
      paymentMethodNames[receiptPaymentData.paymentMethod] ||
      "Cash";

    const credits: NonNullable<DirectPaymentReceiptData["credits"]> = [];
    const creditDetailsMap = new Map<string, { id: string; reference: string; payment: string; type: string }>();

    if (receiptPaymentData.creditDetails && Array.isArray(receiptPaymentData.creditDetails)) {
      receiptPaymentData.creditDetails.forEach((credit) => {
        creditDetailsMap.set(credit.id, credit);
      });
    }

    if (receiptPaymentData.invoiceCredits && Object.keys(receiptPaymentData.invoiceCredits).length > 0) {
      Object.entries(receiptPaymentData.invoiceCredits).forEach(([id, amount]) => {
        const creditDetail = creditDetailsMap.get(id);
        const invoiceRef = creditDetail?.reference || (id.startsWith("I-") ? id : `I-${id}`);

        credits.push({
          type: "Invoice Credit",
          reference: invoiceRef,
          paymentMethod: "",
          amount: "$0.00",
          amountUsed: creditDetail
            ? formatCurrencyAmount(parseFloat(creditDetail.payment))
            : formatCurrencyAmount(amount),
        });
      });
    }

    if (receiptPaymentData.paymentCredits && Object.keys(receiptPaymentData.paymentCredits).length > 0) {
      Object.entries(receiptPaymentData.paymentCredits).forEach(([id, amount]) => {
        const creditDetail = creditDetailsMap.get(id);

        credits.push({
          type: "Payment Credit",
          reference: "",
          paymentMethod: receiptPaymentData.paymentMethodName || "Cash",
          amount: formatCurrencyAmount(amount),
          amountUsed: creditDetail
            ? formatCurrencyAmount(parseFloat(creditDetail.payment))
            : formatCurrencyAmount(amount),
        });
      });
    }

    const lessons =
      receiptPaymentData.lessonDetails && receiptPaymentData.lessonDetails.length > 0
        ? receiptPaymentData.lessonDetails.map((lesson) => ({
            date: lesson.date,
            student: lesson.student,
            program: lesson.program,
            teacher: lesson.teacher,
            amount: formatCurrencyAmount(lesson.amount),
            payment: formatCurrencyAmount(parseFloat(lesson.payment)),
            balance: "$0.00",
          }))
        : Object.entries(receiptPaymentData.lessonPayments || {})
            .filter(([, amount]) => amount > 0)
            .map(([, amount]) => ({
              date: receiptPaymentData.date,
              student: "Student",
              program: "Program",
              teacher: "Teacher",
              amount: formatCurrencyAmount(amount),
              payment: formatCurrencyAmount(amount),
              balance: "$0.00",
            }));

    const groupLessons =
      receiptPaymentData.groupLessonDetails && receiptPaymentData.groupLessonDetails.length > 0
        ? receiptPaymentData.groupLessonDetails.map((groupLesson) => ({
            date: groupLesson.date,
            student: groupLesson.student,
            program: groupLesson.program,
            amount: formatCurrencyAmount(groupLesson.amount),
            balance: "$0.00",
          }))
        : Object.entries(receiptPaymentData.groupLessonPayments || {})
            .filter(([, amount]) => amount > 0)
            .map(([, amount]) => ({
              date: receiptPaymentData.date,
              student: "Student",
              program: "Program",
              amount: formatCurrencyAmount(amount),
              balance: "$0.00",
            }));

    const invoices =
      receiptPaymentData.invoiceDetails && receiptPaymentData.invoiceDetails.length > 0
        ? receiptPaymentData.invoiceDetails.map((invoice) => ({
            date: invoice.date,
            number: invoice.number,
            amount: formatCurrencyAmount(invoice.amount),
            payment: formatCurrencyAmount(parseFloat(invoice.payment)),
            balance: "$0.00",
          }))
        : Object.entries(receiptPaymentData.invoicePayments || {})
            .filter(([, amount]) => amount > 0)
            .map(([id, amount]) => ({
              date: receiptPaymentData.date,
              number: id,
              amount: formatCurrencyAmount(amount),
              payment: formatCurrencyAmount(amount),
              balance: "$0.00",
            }));

    return {
      date: receiptPaymentData.date,
      paymentMethod: paymentMethodName,
      reference: receiptPaymentData.reference || "",
      amount: receiptPaymentData.amountReceived,
      lessons: lessons.length > 0 ? lessons : undefined,
      groupLessons: groupLessons.length > 0 ? groupLessons : undefined,
      invoices: invoices.length > 0 ? invoices : undefined,
      credits: credits.length > 0 ? credits : undefined,
    };
  }, [receiptPaymentData]);

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

        setReceiptPaymentData(paymentData);
        setIsReceivePaymentModalOpen(false);
        toast.success(`Payment of $${finalAmount.toFixed(2)} received successfully`);

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

        try {
          const paymentsResponse = await getCustomerPayments(location, customerId, 1, 1, "id");
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0] as { id?: number | string };
            const paymentId = latestPayment.id;
            if (paymentId != null) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              const { getPaymentReceiptData } = await import("@/components/modal/PaymentReceiptModal");
              const receiptData = await getPaymentReceiptData(location, paymentId);

              let resolvedPaymentMethodName = paymentData.paymentMethodName;
              if (!resolvedPaymentMethodName) {
                resolvedPaymentMethodName = receiptData.info?.paymentMethod || paymentData.paymentMethod;
              }

              setDirectPaymentReceiptData({
                date: receiptData.info?.date || paymentData.date,
                paymentMethod: resolvedPaymentMethodName,
                reference: receiptData.info?.reference || paymentData.reference || "",
                amount: receiptData.info?.amount || paymentData.amountReceived,
                lessons: receiptData.lessons.data.map((lesson) => ({
                  date: lesson.date,
                  student: lesson.student,
                  program: lesson.program,
                  teacher: lesson.teacher,
                  amount: lesson.amount,
                  payment: lesson.payment,
                  balance: "$0.00",
                })),
                groupLessons: receiptData.groupLessons.data.map((groupLesson) => ({
                  date: groupLesson.date,
                  student: groupLesson.student,
                  program: groupLesson.program,
                  amount: groupLesson.amount,
                  balance: "$0.00",
                })),
                invoices: receiptData.invoices.data.map((invoice) => ({
                  date: invoice.date,
                  number: invoice.number,
                  amount: invoice.amount,
                  payment: invoice.payment,
                  balance: "$0.00",
                })),
                credits: credits.length > 0 ? credits : undefined,
              });
            }
          }
        } catch (receiptError) {
          console.error("Error fetching payment receipt data:", receiptError);
        }

        setIsReceiptModalOpen(true);

        await onPaymentSaved?.();
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

      {shouldRenderReceiptModal && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={handleReceiptModalOpenChange}
          location={location}
          customerId={customerId}
          customerName={receiptCustomerName}
          customerEmail={receiptCustomerEmail}
          customerPhone={receiptCustomerPhone}
          mode="new"
          directPaymentData={directPaymentReceiptData ?? transformedReceiptData}
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
