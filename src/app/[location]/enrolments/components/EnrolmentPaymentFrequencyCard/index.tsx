"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentPaymentFrequency } from "../../types";
import { EditPaymentFrequencyModal } from "../modals/EditPaymentFrequencyModal";
import { getPaymentFrequencyOptions, getEnrolmentPaymentFrequency, PaymentFrequencyOption } from "../../[id]/enrolment-details.api";

interface EnrolmentPaymentFrequencyCardProps {
  paymentFrequency: EnrolmentPaymentFrequency | null;
  isLoading?: boolean;
  onSavePaymentFrequency: (data: { paymentFrequency: string; effectiveDate: string }) => Promise<boolean>;
  savingPaymentFrequency?: boolean;
  location: string;
  enrolmentId: string;
}

export const EnrolmentPaymentFrequencyCard = React.memo(function EnrolmentPaymentFrequencyCard({
  paymentFrequency,
  isLoading = false,
  onSavePaymentFrequency,
  savingPaymentFrequency = false,
  location,
  enrolmentId,
}: EnrolmentPaymentFrequencyCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [paymentFrequencyOptions, setPaymentFrequencyOptions] = React.useState<PaymentFrequencyOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(false);
  const [currentPaymentFrequency, setCurrentPaymentFrequency] = React.useState<EnrolmentPaymentFrequency | null>(paymentFrequency);
  const [isLoadingPaymentFrequency, setIsLoadingPaymentFrequency] = React.useState(false);

  // Fetch payment frequency data and options when modal opens
  React.useEffect(() => {
    if (isEditModalOpen) {
      // Fetch current payment frequency data (including effective date)
      setIsLoadingPaymentFrequency(true);
      getEnrolmentPaymentFrequency(location, enrolmentId)
        .then((response) => {
          if (response?.success && response.data?.body) {
            setCurrentPaymentFrequency({
              paymentFrequency: response.data.body.paymentFrequency || "",
              effectiveDate: response.data.body.effectiveDate,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch payment frequency:", error);
        })
        .finally(() => {
          setIsLoadingPaymentFrequency(false);
        });

      // Fetch payment frequency options
      if (paymentFrequencyOptions.length === 0) {
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
    }
  }, [isEditModalOpen, location, enrolmentId, paymentFrequencyOptions.length]);

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
        paymentFrequency={currentPaymentFrequency}
        paymentFrequencyOptions={paymentFrequencyOptions}
        isLoadingOptions={isLoadingOptions || isLoadingPaymentFrequency}
        onSubmit={handleSave}
        saving={savingPaymentFrequency}
      />
    </>
  );
});

