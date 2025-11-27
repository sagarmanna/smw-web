"use client";

import * as React from "react";
import { PaymentReceiptModalContainer } from "../../../customers/components/ReceiptPaymentModal";
import EmailStatementModal, {
  EmailFormData,
} from "../../../customers/components/EmailStatementModal/index";
import { toast } from "sonner";

interface PaymentReceiptModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  paymentId?: string;
  customerName?: string;
  onSaveSuccess?: () => void;
}

export function PaymentReceiptModalWrapper({
  open,
  onOpenChange,
  location,
  paymentId,
  customerName,
  onSaveSuccess,
}: PaymentReceiptModalWrapperProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailModalOverrides, setEmailModalOverrides] = React.useState<{
    subject?: string;
    content?: string;
  } | null>(null);

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

  const handleSendEmail = async (emailFormData: EmailFormData) => {
    // Just show a success message, no API call
    toast.success("Email functionality will be implemented");
    setIsEmailModalOpen(false);
  };

  return (
    <>
      <PaymentReceiptModalContainer
        open={open}
        onOpenChange={onOpenChange}
        location={location}
        paymentId={paymentId}
        customerName={customerName}
        onEdit={onSaveSuccess}
        onDelete={onSaveSuccess}
        onEmail={handleEmail}
      />

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