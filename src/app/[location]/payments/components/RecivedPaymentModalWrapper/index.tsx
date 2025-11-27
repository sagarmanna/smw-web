// components/PaymentReceipt.tsx
"use client";

import * as React from "react";
import { ReceivePaymentModal } from "@/app/[location]/customers/components/ReceivePaymentModal";
import { ReceivePaymentData } from "@/app/[location]/customers/components/ReceivePaymentModal/types";
import { receivePayment, PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import { PaymentReceiptModalContainer } from "@/app/[location]/customers/components/ReceiptPaymentModal";
import EmailStatementModal, {
  EmailFormData,
} from "@/app/[location]/customers/components/EmailStatementModal/index";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatCurrency";

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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [receiptPaymentData, setReceiptPaymentData] = React.useState<ReceivePaymentData | null>(null);
  const [customerName, setCustomerName] = React.useState<string>("");
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailModalOverrides, setEmailModalOverrides] = React.useState<{
    subject?: string;
    content?: string;
  } | null>(null);

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

        if (!response.status) {
          toast.error(
            response.message ||
              response.errors?.join(", ") ||
              "Failed to save payment"
          );
          return;
        }

        toast.success("Payment saved successfully");

        // Store payment data and open receipt modal
        setReceiptPaymentData(paymentData);
        // TODO: Fetch customer name from customerId - for now using placeholder
        setCustomerName(`Customer ${customerIdNum}`);
        onOpenChange(false);
        setIsReceiptModalOpen(true);
        onSaveSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save payment"
        );
      }
    },
    [location, paymentId, onOpenChange, onSaveSuccess]
  );

  const handleEmailModalOpenChange = React.useCallback((open: boolean) => {
    setIsEmailModalOpen(open);
    if (!open) {
      setEmailModalOverrides(null);
    }
  }, []);

  const handleEmail = React.useCallback((payload: {
    subject: string;
    content: string;
    receiptHtml?: string;
  }) => {
    // Set the overrides with receipt content from the receipt modal
    setEmailModalOverrides({
      subject: payload.subject,
      content: payload.content,
    });
    
    // Open the email modal
    setIsEmailModalOpen(true);
  }, []);

  const handleSendEmail = React.useCallback(async (emailFormData: EmailFormData) => {
    // Just show a success message, no API call
    toast.success("Email functionality will be implemented");
    setIsEmailModalOpen(false);
  }, []);

  // Transform payment data for receipt modal
  const transformedReceiptData = React.useMemo(() => {
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
    const paymentMethodName = paymentMethodNames[receiptPaymentData.paymentMethod] || "Cash";

    // Transform lessons (simplified - in real scenario, you'd have full lesson data)
    const lessons = Object.entries(receiptPaymentData.lessonPayments || {})
      .filter(([_, amount]) => amount > 0)
      .map(([id, amount]) => ({
        date: receiptPaymentData.date, // Use payment date as placeholder
        student: "Student", // Placeholder - would come from actual lesson data
        program: "Program", // Placeholder
        teacher: "Teacher", // Placeholder
        amount: formatCurrency(amount),
        payment: formatCurrency(amount),
        balance: "$0.00",
      }));

    // Transform group lessons
    const groupLessons = Object.entries(receiptPaymentData.groupLessonPayments || {})
      .filter(([_, amount]) => amount > 0)
      .map(([id, amount]) => ({
        date: receiptPaymentData.date,
        student: "Student",
        program: "Program",
        amount: formatCurrency(amount),
        balance: "$0.00",
      }));

    // Transform invoices
    const invoices = Object.entries(receiptPaymentData.invoicePayments || {})
      .filter(([_, amount]) => amount > 0)
      .map(([id, amount]) => ({
        date: receiptPaymentData.date,
        number: id,
        amount: formatCurrency(amount),
        payment: formatCurrency(amount),
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
    };
  }, [receiptPaymentData]);

  return (
    <>
    <ReceivePaymentModal
      open={open}
      onOpenChange={onOpenChange}
      onSave={handleSavePayment}
      location={location}
      customerId="0"
    />

      {/* Payment Receipt Modal */}
      {transformedReceiptData && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={setIsReceiptModalOpen}
          location={location}
          customerId={Number(receiptPaymentData?.customer) || undefined}
          customerName={customerName}
          mode="new"
          directPaymentData={transformedReceiptData}
          onEmail={handleEmail}
        />
      )}

      {/* Email Modal */}
      <EmailStatementModal
        open={isEmailModalOpen}
        onOpenChange={handleEmailModalOpenChange}
        onSend={handleSendEmail}
        customerName={customerName}
        customerEmails={[]}
        locationName="Arcadia Academy of Music"
        initialSubject={emailModalOverrides?.subject ?? "Payment from Arcadia Academy of Music"}
        initialContent={emailModalOverrides?.content ?? ""}
        privateLessonDueData={[]}
        groupLessonDueData={[]}
        invoiceData={[]}
        creditData={[]}
        totalBalance="$0.00"
        showDeleteButton={false}
      />
    </>
  );
}
