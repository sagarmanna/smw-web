// components/ReceivePayment.tsx
"use client";

import * as React from "react";
import { ReceivePaymentModal } from "@/app/[location]/customers/components/ReceivePaymentModal";
import { ReceivePaymentData } from "@/app/[location]/customers/components/ReceivePaymentModal/types";

interface PaymentsReceivePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ReceivePaymentData) => void;
  location: string;
  customerId?: string;
  customerName?: string;
}

/**
 * Wrapper component for Receive Payment Modal in Payments page
 * This is NOT a customer route, so it will show the customer dropdown
 */
export function PaymentsReceivePaymentModal({
  open,
  onOpenChange,
  onSave,
  location,
  customerId,
  customerName,
}: PaymentsReceivePaymentModalProps) {
  return (
    <ReceivePaymentModal
      open={open}
      onOpenChange={onOpenChange}
      onSave={onSave}
      location={location}
      // Pass customerId as undefined or '0' to trigger dropdown mode
      // The modal will detect that the route doesn't contain "customer"
      customerId={customerId || '0'}
      customerName={customerName}
    />
  );
}