"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UnscheduleReasonModal } from "../UnscheduleReasonModal";

interface PrivateLessonScheduleCardProps {
  details: PrivateLessonDetails | null;
  isLoading?: boolean;
  location: string;
}

export const PrivateLessonScheduleCard = React.memo(function PrivateLessonScheduleCard({
  details,
  isLoading = false,
  location,
}: PrivateLessonScheduleCardProps) {
  const router = useRouter();
  const [isUnscheduleModalOpen, setIsUnscheduleModalOpen] = React.useState(false);

  const handleTeacherClick = React.useCallback(() => {
    if (details?.schedule.teacherId) {
      router.push(`/${location}/teachers/${details.schedule.teacherId}`);
    }
  }, [details?.schedule.teacherId, location, router]);

  const handleEditClick = React.useCallback(() => {
    toast.info("This feature is under process");
  }, []);

  const handleUnscheduleClick = React.useCallback(() => {
    setIsUnscheduleModalOpen(true);
  }, []);

  const handleGenerateInvoiceClick = React.useCallback(() => {
    toast.error("Invoice can be generated against completed scheduled lessons only.");
  }, []);

  const handleUnscheduleSave = React.useCallback((reason: string) => {
    // TODO: Implement unschedule functionality
    console.log("Unschedule reason:", reason);
    toast.success("Lesson unscheduled successfully");
    setIsUnscheduleModalOpen(false);
  }, []);


  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const teacherValue = details?.schedule.teacherId ? (
      <span
        onClick={handleTeacherClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {details?.schedule.teacher || "N/A"}
      </span>
    ) : (
      details?.schedule.teacher || "N/A"
    );

    return [
      {
        label: "Teacher",
        value: teacherValue,
      },
      {
        label: "Scheduled Date",
        value: details?.schedule.scheduledDate || "N/A",
      },
      {
        label: "Time",
        value: details?.schedule.time || "N/A",
      },
      {
        label: "Duration",
        value: details?.schedule.duration || "N/A",
      },
      {
        label: "Expiry Date",
        value: details?.schedule.expiryDate || "N/A",
      },
    ];
  }, [details, handleTeacherClick]);

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
              <DropdownMenuItem onClick={handleEditClick}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUnscheduleClick}>
                Unschedule Lesson
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGenerateInvoiceClick}>
                Generate Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <UnscheduleReasonModal
        open={isUnscheduleModalOpen}
        onOpenChange={setIsUnscheduleModalOpen}
        onSave={handleUnscheduleSave}
      />
    </>
  );
});

