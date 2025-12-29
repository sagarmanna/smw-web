"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivateLessonCostCardProps {
  details: PrivateLessonDetails | null;
  onSaveCost: (data: { costPerHour?: string; cost?: string; price?: string }) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonCostCard = React.memo(function PrivateLessonCostCard({
  details,
  onSaveCost,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonCostCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Cost/hr",
        value: details?.cost.costPerHour || "N/A",
      },
      {
        label: "Cost",
        value: details?.cost.cost || "N/A",
      },
      {
        label: "Price",
        value: details?.cost.price || "N/A",
      },
      {
        label: "Profit",
        value: details?.cost.profit || "N/A",
      },
    ];
  }, [details]);

  const handleViewClick = React.useCallback(() => {
    toast.info("This feature is under process");
  }, []);

  const handleEditClick = React.useCallback(() => {
    toast.info("This feature is under process");
  }, []);

  return (
    <SectionCard
      title="Cost"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
      headerActions={
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleViewClick}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <EditButton onClick={handleEditClick} />
        </>
      }
    />
  );
});

