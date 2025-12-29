"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";

interface PrivateLessonDueDateCardProps {
  details: PrivateLessonDetails | null;
  onSaveDueDate: (dueDate: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonDueDateCard = React.memo(function PrivateLessonDueDateCard({
  details,
  onSaveDueDate,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonDueDateCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Due Date",
        value: details?.dueDate || "N/A",
      },
    ];
  }, [details]);

  const handleEditClick = React.useCallback(() => {
    toast.info("This feature is under process");
  }, []);

  return (
    <SectionCard
      title="Due Date"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
      headerActions={
        <>
          <EditButton onClick={handleEditClick} />
        </>
      }
    />
  );
});

