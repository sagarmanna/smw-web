"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentPaymentFrequency } from "../../types";
import { EditPaymentFrequencyModal } from "../modals/EditPaymentFrequencyModal";
import { getPaymentFrequencyOptions, PaymentFrequencyOption } from "../../[id]/enrolment-details.api";

interface EnrolmentPaymentFrequencyCardProps {
  paymentFrequency: EnrolmentPaymentFrequency | null;
  isLoading?: boolean;
  onSavePaymentFrequency: (data: { paymentFrequency: string; effectiveDate: string }) => Promise<boolean>;
  savingPaymentFrequency?: boolean;
  location: string;
}

export const EnrolmentPaymentFrequencyCard = React.memo(function EnrolmentPaymentFrequencyCard({
  paymentFrequency,
  isLoading = false,
  onSavePaymentFrequency,
  savingPaymentFrequency = false,
  location,
}: EnrolmentPaymentFrequencyCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [paymentFrequencyOptions, setPaymentFrequencyOptions] = React.useState<PaymentFrequencyOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(false);

  // Fetch payment frequency options when modal opens
  React.useEffect(() => {
    if (isEditModalOpen && paymentFrequencyOptions.length === 0) {
      setIsLoadingOptions(true);
      getPaymentFrequencyOptions(location)
        .then((response) => {
          if (response?.success && response.data) {
            setPaymentFrequencyOptions(response.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch payment frequency options:", error);
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [isEditModalOpen, location, paymentFrequencyOptions.length]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Payment Frequency",
        value: paymentFrequency?.paymentFrequency || "N/A",
      },
    ];
  }, [paymentFrequency]);

  const handleSave = React.useCallback(async (data: { paymentFrequency: string; effectiveDate: string }): Promise<boolean> => {
    const success = await onSavePaymentFrequency(data);
    if (success) {
      setIsEditModalOpen(false);
    }
    return success;
  }, [onSavePaymentFrequency]);

  return (
    <>
      <SectionCard
        title="Payment Frequency"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={() => setIsEditModalOpen(true)} />
          </>
        }
      />
      <EditPaymentFrequencyModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        paymentFrequency={paymentFrequency}
        paymentFrequencyOptions={paymentFrequencyOptions}
        isLoadingOptions={isLoadingOptions}
        onSubmit={handleSave}
        saving={savingPaymentFrequency}
      />
    </>
  );
});

