"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentDiscounts, EnrolmentSchedule, EnrolmentDetails } from "../../types";
import { EditEnrolmentDiscountsModal } from "../modals/EditEnrolmentDiscountsModal";

interface EnrolmentDiscountsCardProps {
  discounts: EnrolmentDiscounts | null;
  schedule?: EnrolmentSchedule | null;
  details?: EnrolmentDetails | null;
  onSaveDiscounts: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  savingDiscounts?: boolean;
  isLoading?: boolean;
}

export const EnrolmentDiscountsCard = React.memo(function EnrolmentDiscountsCard({
  discounts,
  schedule,
  details,
  onSaveDiscounts,
  savingDiscounts = false,
  isLoading = false,
}: EnrolmentDiscountsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "PF Discount",
        value: discounts?.pfDiscount || "Not set",
      },
      {
        label: "Multiple Enrol. Discount",
        value: discounts?.multipleEnrolDiscount || "Not set",
      },
    ];
  }, [discounts]);

  const handleSave = React.useCallback(
    async (data: Partial<EnrolmentDiscounts>): Promise<boolean> => {
      const success = await onSaveDiscounts(data);
      
      if (success) {
        setIsEditModalOpen(false);
      }
      
      return success;
    },
    [onSaveDiscounts]
  );

  return (
    <>
      <SectionCard
        title="Discounts"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={() => setIsEditModalOpen(true)} />
          </>
        }
      />

      <EditEnrolmentDiscountsModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        discounts={discounts}
        schedule={schedule}
        details={details}
        onSubmit={handleSave}
        saving={savingDiscounts}
      />
    </>
  );
});

