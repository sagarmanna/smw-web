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
import { getPaymentReceiptData } from "@/app/[location]/customers/components/ReceiptPaymentModal/receipt-payment.api";
import { getCustomerPayments, getCustomerInfo } from "@/app/[location]/customers/customers.api";

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
  const [directPaymentReceiptData, setDirectPaymentReceiptData] = React.useState<{
    date: string;
    paymentMethod: string;
    reference: string;
    amount: number;
    lessons?: Array<{
      date: string;
      student: string;
      program: string;
      teacher: string;
      amount: string;
      payment: string;
      balance: string;
    }>;
    groupLessons?: Array<{
      date: string;
      student: string;
      program: string;
      amount: string;
      balance: string;
    }>;
    invoices?: Array<{
      date: string;
      number: string;
      amount: string;
      payment: string;
      balance: string;
    }>;
    credits?: Array<{
      type: string;
      reference: string;
      paymentMethod?: string;
      amount: string;
      amountUsed: string;
    }>;
  } | null>(null);
  const [customerName, setCustomerName] = React.useState<string>("");
  const [customerPhone, setCustomerPhone] = React.useState<string>("");
  const [customerEmail, setCustomerEmail] = React.useState<string>("");
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

        // Call API to save payment
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

        // Store payment data
        setReceiptPaymentData(paymentData);
        onOpenChange(false);

        // Fetch customer info for receipt
        try {
          const customerInfo = await getCustomerInfo(location, customerIdNum);
          if (customerInfo?.success && customerInfo.data) {
            const profile = customerInfo.data.profile;
            const emails = customerInfo.data.email || [];
            const phones = customerInfo.data.phone || [];
            
            // Get primary email/phone or first available
            const primaryEmail = emails.find((e) => e.isPrimary) || emails[0];
            const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
            
            setCustomerName(profile?.name || `Customer ${customerIdNum}`);
            setCustomerPhone(primaryPhone?.number || "");
            setCustomerEmail(primaryEmail?.email || "");
          } else {
            // Fallback if customer info fetch fails
            setCustomerName(`Customer ${customerIdNum}`);
            setCustomerPhone("");
            setCustomerEmail("");
          }
        } catch (error) {
          console.error("Error fetching customer info:", error);
          // Fallback if customer info fetch fails
          setCustomerName(`Customer ${customerIdNum}`);
          setCustomerPhone("");
          setCustomerEmail("");
        }

        // Fetch receipt data from API after saving (similar to CustomerDetailClient)
        try {
          // Refresh payments list to get the latest payment
          const paymentsResponse = await getCustomerPayments(
            location,
            customerIdNum,
            1,
            1
          );
          
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0];
            
            // Small delay to ensure payment is fully saved in database
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fetch payment receipt data which includes lessons
            const receiptData = await getPaymentReceiptData(location, latestPayment.id);
            
            // Use payment method name from paymentData if available, otherwise use from receiptData
            let paymentMethodName = paymentData.paymentMethodName;
            if (!paymentMethodName) {
              paymentMethodName = receiptData.info?.paymentMethod || paymentData.paymentMethod;
            }
            
            // Build credits data for Payments Used table
            const credits: Array<{
              type: string;
              reference: string;
              paymentMethod?: string;
              amount: string;
              amountUsed: string;
            }> = [];
            
            // Get credit details if available
            const creditDetailsMap = new Map<string, { id: string; reference: string; payment: string; type: string }>();
            if (paymentData.creditDetails && Array.isArray(paymentData.creditDetails)) {
              paymentData.creditDetails.forEach((credit) => {
                creditDetailsMap.set(credit.id, credit);
              });
            }
            
            // Add invoice credits first
            if (paymentData.invoiceCredits && Object.keys(paymentData.invoiceCredits).length > 0) {
              Object.entries(paymentData.invoiceCredits).forEach(([id, amount]) => {
                const creditDetail = creditDetailsMap.get(id);
                const invoiceRef = creditDetail?.reference || (id.startsWith("I-") ? id : `I-${id}`);
                credits.push({
                  type: "Invoice Credit",
                  reference: invoiceRef,
                  paymentMethod: "",
                  amount: "$0.00",
                  amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount),
                });
              });
            }
            
            // Add payment credits
            if (paymentData.paymentCredits && Object.keys(paymentData.paymentCredits).length > 0) {
              Object.entries(paymentData.paymentCredits).forEach(([id, amount]) => {
                const creditDetail = creditDetailsMap.get(id);
                credits.push({
                  type: "Payment Credit",
                  reference: "",
                  paymentMethod: paymentData.paymentMethodName || "Visa",
                  amount: formatCurrency(amount),
                  amountUsed: creditDetail ? formatCurrency(parseFloat(creditDetail.payment)) : formatCurrency(amount),
                });
              });
            }
            
            // Build directPaymentData from receipt data
            const directData = {
              date: receiptData.info?.date || paymentData.date,
              paymentMethod: paymentMethodName,
              reference: receiptData.info?.reference || paymentData.reference || "",
              amount: receiptData.info?.amount || paymentData.amountReceived,
              lessons: receiptData.lessons.data.map(lesson => ({
                date: lesson.date,
                student: lesson.student,
                program: lesson.program,
                teacher: lesson.teacher,
                amount: lesson.amount,
                payment: lesson.payment,
                balance: "$0.00",
              })),
              groupLessons: receiptData.groupLessons.data.map(gl => ({
                date: gl.date,
                student: gl.student,
                program: gl.program,
                amount: gl.amount,
                balance: "$0.00",
              })),
              invoices: receiptData.invoices.data.map(inv => ({
                date: inv.date,
                number: inv.number,
                amount: inv.amount,
                payment: inv.payment,
                balance: "$0.00",
              })),
              credits: credits.length > 0 ? credits : undefined,
            };
            
            // Store the API receipt data directly (similar to CustomerDetailClient)
            setDirectPaymentReceiptData(directData);
            setIsReceiptModalOpen(true);
          } else {
            // If we can't get the payment, still show receipt with paymentData
            setIsReceiptModalOpen(true);
          }
          
          // Refresh payments list
          onSaveSuccess?.();
        } catch (error) {
          console.error("Error fetching payment receipt data:", error);
          // Still show receipt modal with paymentData details as fallback
          setIsReceiptModalOpen(true);
          onSaveSuccess?.();
        }
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
    const paymentMethodName = receiptPaymentData.paymentMethodName || 
                              paymentMethodNames[receiptPaymentData.paymentMethod] || 
                              "Cash";

    // Helper function to format currency
    const formatCurrencyAmount = (amount: number): string => {
      return formatCurrency(amount);
    };

    // Build credits data for Payments Used table
    const credits: Array<{
      type: string;
      reference: string;
      paymentMethod?: string;
      amount: string;
      amountUsed: string;
    }> = [];
    
    // Get credit details if available
    const creditDetailsMap = new Map<string, { id: string; reference: string; payment: string; type: string }>();
    if (receiptPaymentData.creditDetails && Array.isArray(receiptPaymentData.creditDetails)) {
      receiptPaymentData.creditDetails.forEach((credit) => {
        creditDetailsMap.set(credit.id, credit);
      });
    }
    
    // Add invoice credits first (they should appear first in the table)
    if (receiptPaymentData.invoiceCredits && Object.keys(receiptPaymentData.invoiceCredits).length > 0) {
      Object.entries(receiptPaymentData.invoiceCredits).forEach(([id, amount]) => {
        const creditDetail = creditDetailsMap.get(id);
        // For invoice credits, reference should be the invoice number (like "I-94673")
        const invoiceRef = creditDetail?.reference || (id.startsWith("I-") ? id : `I-${id}`);
        credits.push({
          type: "Invoice Credit",
          reference: invoiceRef,
          paymentMethod: "", // Empty for invoice credit
          amount: "$0.00", // Always $0.00 for invoice credit
          amountUsed: creditDetail ? formatCurrencyAmount(parseFloat(creditDetail.payment)) : formatCurrencyAmount(amount),
        });
      });
    }
    
    // Add payment credits
    if (receiptPaymentData.paymentCredits && Object.keys(receiptPaymentData.paymentCredits).length > 0) {
      Object.entries(receiptPaymentData.paymentCredits).forEach(([id, amount]) => {
        const creditDetail = creditDetailsMap.get(id);
        credits.push({
          type: "Payment Credit",
          reference: "", // Empty for payment credit
          paymentMethod: receiptPaymentData.paymentMethodName || "Visa", // Use payment method name if available
          amount: formatCurrencyAmount(amount), // Amount to apply
          amountUsed: creditDetail ? formatCurrencyAmount(parseFloat(creditDetail.payment)) : formatCurrencyAmount(amount),
        });
      });
    }

    // Transform lessons using actual lesson details if available
    const lessons = receiptPaymentData.lessonDetails && receiptPaymentData.lessonDetails.length > 0
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
          .filter(([_, amount]) => amount > 0)
          .map(([id, amount]) => ({
            date: receiptPaymentData.date,
            student: "Student", // Fallback placeholder if no details
            program: "Program",
            teacher: "Teacher",
            amount: formatCurrencyAmount(amount),
            payment: formatCurrencyAmount(amount),
            balance: "$0.00",
          }));

    // Transform group lessons using actual group lesson details if available
    const groupLessons = receiptPaymentData.groupLessonDetails && receiptPaymentData.groupLessonDetails.length > 0
      ? receiptPaymentData.groupLessonDetails.map((gl) => ({
          date: gl.date,
          student: gl.student,
          program: gl.program,
          amount: formatCurrencyAmount(gl.amount),
          balance: "$0.00",
        }))
      : Object.entries(receiptPaymentData.groupLessonPayments || {})
          .filter(([_, amount]) => amount > 0)
          .map(([id, amount]) => ({
            date: receiptPaymentData.date,
            student: "Student", // Fallback placeholder if no details
            program: "Program",
            amount: formatCurrencyAmount(amount),
            balance: "$0.00",
          }));

    // Transform invoices using actual invoice details if available
    const invoices = receiptPaymentData.invoiceDetails && receiptPaymentData.invoiceDetails.length > 0
      ? receiptPaymentData.invoiceDetails.map((inv) => ({
          date: inv.date,
          number: inv.number,
          amount: formatCurrencyAmount(inv.amount),
          payment: formatCurrencyAmount(parseFloat(inv.payment)),
          balance: "$0.00",
        }))
      : Object.entries(receiptPaymentData.invoicePayments || {})
          .filter(([_, amount]) => amount > 0)
          .map(([id, amount]) => ({
            date: receiptPaymentData.date,
            number: id,
            amount: formatCurrencyAmount(amount),
            payment: formatCurrencyAmount(amount),
            balance: "$0.00",
          }));

    const transformedData = {
      date: receiptPaymentData.date,
      paymentMethod: paymentMethodName,
      reference: receiptPaymentData.reference || "",
      amount: receiptPaymentData.amountReceived,
      lessons: lessons.length > 0 ? lessons : undefined,
      groupLessons: groupLessons.length > 0 ? groupLessons : undefined,
      invoices: invoices.length > 0 ? invoices : undefined,
      credits: credits.length > 0 ? credits : undefined,
    };

    return transformedData;
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
      {(directPaymentReceiptData || transformedReceiptData) && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={(open) => {
            setIsReceiptModalOpen(open);
            if (!open) {
              setDirectPaymentReceiptData(null);
              setCustomerName("");
              setCustomerPhone("");
              setCustomerEmail("");
            }
          }}
          location={location}
          customerId={Number(receiptPaymentData?.customer) || undefined}
          customerName={customerName}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
          mode="new"
          directPaymentData={directPaymentReceiptData || transformedReceiptData}
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
