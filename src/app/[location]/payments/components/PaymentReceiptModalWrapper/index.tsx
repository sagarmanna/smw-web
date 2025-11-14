"use client";
import * as React from "react";
import { PaymentReceiptModalUI } from "@/components/Modals/PaymentReceiptModal";
import { usePaymentReceiptModal } from "./hooks/usePaymentReceiptModal";

interface PaymentReceiptModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  paymentId?: string;
  onSaveSuccess?: () => void;
}

export function PaymentReceiptModalWrapper({
  open,
  onOpenChange,
  location,
  paymentId,
  onSaveSuccess,
}: PaymentReceiptModalWrapperProps) {
  const receiptHtmlRef = React.useRef<HTMLDivElement | null>(null);

  // Use single hook for all business logic
  const {
    // States
    isEditing,
    showDeleteConfirm,
    isSaving,
    isLoadingPaymentMethods,
    
    // Data
    paymentData,
    paymentMethods,
    editDate,
    editForm,
    
    // Edit rows
    lessonEditRows,
    groupLessonEditRows,
    invoiceEditRows,
    
    // Calculations
    amountToApply,
    amountToCredit,
    
    // Handlers
    handleEditClick,
    handleCancelEdit,
    handleSave,
    handlePrint,
    handleEmail,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleLessonAllocationChange,
    handleGroupLessonAllocationChange,
    handleInvoiceAllocationChange,
    setEditDate,
    handleEditFormChange,
  } = usePaymentReceiptModal({
    open,
    paymentId,
    location,
    onSaveSuccess,
  });

  // Single return with all props - no duplicate returns
  return (
    <PaymentReceiptModalUI
      open={open}
      onOpenChange={onOpenChange}
      isEditing={isEditing}
      showDeleteConfirm={showDeleteConfirm}
      isSaving={isSaving}
      isLoadingPaymentMethods={isLoadingPaymentMethods}
      paymentMethods={paymentMethods}
      editDate={editDate}
      editForm={editForm}
      headerAmount={paymentData.headerAmount}
      paymentDate={paymentData.paymentDate}
      paymentMethod={paymentData.paymentMethod}
      customerName={paymentData.customerName}
      showAllocations={paymentData.showAllocations}
      receiptHtml=""
      allocationRows={paymentData.allocationRows}
      groupLessonRows={paymentData.groupLessonRows}
      invoiceRows={paymentData.invoiceRows}
      receiptRows={paymentData.receiptRows}
      lessonEditRows={lessonEditRows}
      groupLessonEditRows={groupLessonEditRows}
      invoiceEditRows={invoiceEditRows}
      amountToApply={amountToApply}
      amountToCredit={amountToCredit}
      receiptHtmlRef={receiptHtmlRef}
      onEditClick={handleEditClick}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      onPrint={handlePrint}
      onEmail={handleEmail}
      onDelete={handleDelete}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
      onLessonAllocationChange={handleLessonAllocationChange}
      onGroupLessonAllocationChange={handleGroupLessonAllocationChange}
      onInvoiceAllocationChange={handleInvoiceAllocationChange}
      onEditDateChange={setEditDate}
      onEditFormChange={handleEditFormChange}
    />
  );
}