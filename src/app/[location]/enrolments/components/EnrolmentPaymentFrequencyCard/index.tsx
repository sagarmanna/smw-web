"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentPaymentFrequency } from "../../types";

interface EnrolmentPaymentFrequencyCardProps {
  paymentFrequency: EnrolmentPaymentFrequency | null;
  isLoading?: boolean;
}

export const EnrolmentPaymentFrequencyCard = React.memo(function EnrolmentPaymentFrequencyCard({
  paymentFrequency,
  isLoading = false,
}: EnrolmentPaymentFrequencyCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Payment Frequency",
        value: paymentFrequency?.paymentFrequency || "N/A",
      },
    ];
  }, [paymentFrequency]);

  return (
    <SectionCard
      title="Payment Frequency"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
      headerActions={
        <>
          <EditButton onClick={() => {}} />
        </>
      }
    />
  );
});

