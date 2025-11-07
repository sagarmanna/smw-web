"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  PaymentReceiptModal as CustomerPaymentReceiptModal,
  type PaymentReceiptData,
} from "@/app/[location]/customers/components/PaymentReceiptModal";

export interface PaymentRowLike {
  date: Date;
  customer: string;
  paymentMethod: string;
  reference?: string | null;
  amount: number;
}

interface PaymentsReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row?: PaymentRowLike | null;
  customerEmail?: string;
  customerPhone?: string;
  locationName?: string;
}

export function PaymentsReceiptModal({
  open,
  onOpenChange,
  row,
  customerEmail,
  customerPhone,
  locationName,
}: PaymentsReceiptModalProps) {
  const payment: PaymentReceiptData | null = row
    ? {
        date: format(row.date, "MMM dd, yyyy"),
        notes: row.paymentMethod,
        amount: row.amount,
        used: row.amount,
        remaining: 0,
      }
    : null;

  return (
    <CustomerPaymentReceiptModal
      open={open}
      onOpenChange={onOpenChange}
      payment={payment || undefined}
      customerName={row?.customer}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
      locationName={locationName}
      // Exclude group lesson data by not passing it
      groupLessonDueData={[]}
      onEdit={() => {}}
      onDelete={() => {}}
      onPrint={() => {}}
      onEmail={() => {}}
    />
  );
}

export default PaymentsReceiptModal;


