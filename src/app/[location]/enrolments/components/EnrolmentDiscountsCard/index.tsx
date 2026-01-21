"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentDiscounts, EnrolmentSchedule, EnrolmentDetails } from "../../types";
import { EditEnrolmentDiscountsModal } from "../modals/EditEnrolmentDiscountsModal";
import { ENROLMENT_CONSTANTS } from "../../utils/constants";
import { toast } from "sonner";
import { isDev } from "@/utils/env";

interface EnrolmentDiscountsCardProps {
  discounts: EnrolmentDiscounts | null;
  schedule?: EnrolmentSchedule | null;
  details?: EnrolmentDetails | null;
  onSaveDiscounts: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  savingDiscounts?: boolean;
  isLoading?: boolean;
  enrolmentType?: "private" | "group"; // Pass enrolment type for conditional rendering
  location: string;
  enrolmentId: string;
}

export const EnrolmentDiscountsCard = React.memo(function EnrolmentDiscountsCard({
  discounts,
  schedule,
  details,
  onSaveDiscounts,
  savingDiscounts = false,
  isLoading = false,
  enrolmentType = "private", // Default to private if not provided
  location,
  enrolmentId,
}: EnrolmentDiscountsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    // For group enrolments, show single "Discount" field
    if (enrolmentType === "group") {
      return [
        {
          label: "Discount",
          value: discounts?.discount || ENROLMENT_CONSTANTS.DEFAULT_NOT_SET,
        },
      ];
    }
    
    // For private enrolments, show PF Discount and Multiple Enrol. Discount
    return [
      {
        label: "PF Discount",
        value: discounts?.pfDiscount || ENROLMENT_CONSTANTS.DEFAULT_NOT_SET,
      },
      {
        label: "Multiple Enrol. Discount",
        value: discounts?.multipleEnrolDiscount || ENROLMENT_CONSTANTS.DEFAULT_NOT_SET,
      },
    ];
  }, [discounts, enrolmentType]);

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

  const handleEditClick = React.useCallback(async () => {
    // if (!isDev()) {
    //   toast.info("This feature is in development.");
    //   return;
    // }

    // Check validation before opening modal - call preview endpoint
    // If preview fails with validation error, show error message
    try {
      const { getEnrolmentDiscountPreview } = await import('../../[id]/enrolment-details.api');
      const previewResponse = await getEnrolmentDiscountPreview(location, enrolmentId);
      
      if (!previewResponse?.success) {
        // Check if it's a validation error
        const errorMessage = previewResponse?.message || "You can't edit discounts.";
        if (errorMessage.includes("can't edit discounts")) {
          toast.error(errorMessage);
          return;
        }
      }
      
      // Validation passed, open modal
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: { message?: string; errorCode?: string };
          status?: number;
        };
        message?: string;
      };
      
      const errorMessage = apiError.response?.data?.message || apiError.message || "You can't edit discounts.";
      if (errorMessage.includes("can't edit discounts") || apiError.response?.status === 400) {
        toast.error(errorMessage);
        return;
      }
      
      // Other errors - still open modal (might be network issue)
      setIsEditModalOpen(true);
    }
  }, [location, enrolmentId]);

  return (
    <>
      <SectionCard
        title="Discounts"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={handleEditClick} />
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
        enrolmentType={enrolmentType}
        location={location}
        enrolmentId={enrolmentId}
      />
    </>
  );
});

