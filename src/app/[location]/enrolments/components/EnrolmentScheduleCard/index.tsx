"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentSchedule } from "../../types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AdjustEndDateModal } from "../modals/AdjustEndDateModal";
import { PermanentScheduleChangeModal } from "../modals/PermanentScheduleChangeModal";

interface EnrolmentScheduleCardProps {
  schedule: EnrolmentSchedule | null;
  onAdjustEndDate: (endDate: string) => Promise<boolean>;
  onChangeSchedulePermanently: (startingDate: string) => Promise<boolean>;
  saving?: boolean;
  isLoading?: boolean;
}

export const EnrolmentScheduleCard = React.memo(function EnrolmentScheduleCard({
  schedule,
  onAdjustEndDate,
  onChangeSchedulePermanently,
  saving = false,
  isLoading = false,
}: EnrolmentScheduleCardProps) {
  const [isAdjustEndDateModalOpen, setIsAdjustEndDateModalOpen] = React.useState(false);
  const [isPermanentChangeModalOpen, setIsPermanentChangeModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Day",
        value: schedule?.day || "N/A",
      },
      {
        label: "Time",
        value: schedule?.time || "N/A",
      },
      {
        label: "Start Date",
        value: schedule?.startDate || "N/A",
      },
      {
        label: "End Date",
        value: schedule?.endDate || "N/A",
      },
    ];
  }, [schedule]);

  const handleAdjustEndDate = React.useCallback(
    async (endDate: string): Promise<boolean> => {
      const success = await onAdjustEndDate(endDate);
      if (success) {
        setIsAdjustEndDateModalOpen(false);
      }
      return success;
    },
    [onAdjustEndDate]
  );

  const handlePermanentChange = React.useCallback(
    async (startingDate: string): Promise<boolean> => {
      const success = await onChangeSchedulePermanently(startingDate);
      if (success) {
        setIsPermanentChangeModalOpen(false);
      }
      return success;
    },
    [onChangeSchedulePermanently]
  );

  return (
    <>
      <SectionCard
        title="Schedule"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAdjustEndDateModalOpen(true)}>
                Adjust enddate...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPermanentChangeModalOpen(true)}>
                Permanent Schedule Change...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <AdjustEndDateModal
        open={isAdjustEndDateModalOpen}
        onClose={() => setIsAdjustEndDateModalOpen(false)}
        schedule={schedule}
        onSubmit={handleAdjustEndDate}
        saving={saving}
      />

      <PermanentScheduleChangeModal
        open={isPermanentChangeModalOpen}
        onClose={() => setIsPermanentChangeModalOpen(false)}
        schedule={schedule}
        onSubmit={handlePermanentChange}
        saving={saving}
      />
    </>
  );
});

