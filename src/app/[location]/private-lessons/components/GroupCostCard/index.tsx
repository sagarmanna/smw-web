"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";

interface GroupCostCardProps {
  costData: {
    costPerHour?: string;
    cost?: string;
    costPerStudent?: string;
  } | null;
  isLoading?: boolean;
}

export const GroupCostCard = React.memo(function GroupCostCard({
  costData,
  isLoading = false,
}: GroupCostCardProps) {
  const costRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Cost/hr",
        value: costData?.costPerHour || "N/A",
      },
      {
        label: "Cost",
        value: costData?.cost || "N/A",
      },
      {
        label: "Cost Per Student",
        value: costData?.costPerStudent || "N/A",
      },
    ];
  }, [costData]);

  return (
    <SectionCard
      title="Cost"
      data={costRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});
