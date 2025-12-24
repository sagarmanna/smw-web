"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentDiscounts } from "../../types";

interface EnrolmentDiscountsCardProps {
  discounts: EnrolmentDiscounts | null;
  isLoading?: boolean;
}

export const EnrolmentDiscountsCard = React.memo(function EnrolmentDiscountsCard({
  discounts,
  isLoading = false,
}: EnrolmentDiscountsCardProps) {
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

  return (
    <SectionCard
      title="Discounts"
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

