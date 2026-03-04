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
import { EditScheduleModal } from "./EditScheduleModal";
import { generatePrivateLessonInvoice } from "../../[id]/private-lesson-details.api";

interface PrivateLessonScheduleCardProps {
  details: PrivateLessonDetails | null;
  isLoading?: boolean;
  location: string;
  /**
   * When true, lesson is already exploded and only edit action should be shown.
   */
  isExploded?: boolean;
  /**
   * When true, hides the Generate Invoice action from the schedule header menu.
   * Used for group lessons where invoice generation is not supported.
   */
  hideGenerateInvoice?: boolean;
  /**
   * Callback to unschedule the lesson. Should handle the API call and return promise.
   */
  onUnschedule?: (reason: string) => Promise<boolean>;
  /**
   * Called after a successful schedule edit so the parent can refresh lesson data.
   */
  onScheduleEdited?: () => void;
}

export const PrivateLessonScheduleCard = React.memo(function PrivateLessonScheduleCard({
  details,
  isLoading = false,
  location,
  isExploded = false,
  hideGenerateInvoice = false,
  onUnschedule,
  onScheduleEdited,
}: PrivateLessonScheduleCardProps) {
  const router = useRouter();
  const [isUnscheduleModalOpen, setIsUnscheduleModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const normalizedStatus = details?.status?.toLowerCase() || "";
  const hasScheduledDate = Boolean(details?.schedule?.scheduledDate);
  const isUnscheduledStatus = normalizedStatus.includes("unscheduled") || !hasScheduledDate;
  const isRescheduled = normalizedStatus.includes("rescheduled");
  const isAbsentOrCompletedStatus =
    normalizedStatus.includes("absent") || normalizedStatus.includes("completed");
  const isExplodedStatus = /\bexploded\b/i.test(normalizedStatus);
  const shouldForceShowAllActions = isRescheduled;
  const shouldHideSecondaryActions = isUnscheduledStatus && !isExplodedStatus;
  const shouldShowSecondaryActions =
    !shouldHideSecondaryActions && (shouldForceShowAllActions || !isExploded);
  const shouldShowHeaderActions = !isAbsentOrCompletedStatus;

  const handleTeacherClick = React.useCallback(() => {
    if (details?.schedule.teacherId) {
      router.push(`/${location}/teachers/${details.schedule.teacherId}`);
    }
  }, [details?.schedule.teacherId, location, router]);

  const handleEditClick = React.useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleUnscheduleClick = React.useCallback(() => {
    setIsUnscheduleModalOpen(true);
  }, []);

  const handleGenerateInvoiceClick = React.useCallback(async () => {
    const lessonId = details?.id;
    if (!lessonId) {
      toast.error("Lesson ID is missing");
      return;
    }

    const response = await generatePrivateLessonInvoice(location, String(lessonId));

    if (!response || !response.success) {
      toast.error(response?.message || "Failed to generate invoice");
      return;
    }

    const successMessage =
      response.data?.message && response.data.message.trim() !== ""
        ? response.data.message
        : response.message && response.message.trim() !== ""
          ? response.message
          : "Invoice generated successfully";

    toast.success(successMessage);

    // Prefer valid redirect paths and ignore malformed values (e.g. containing "undefined").
    const redirectPath =
      [response.data?.legacyRedirectUrl, response.data?.url].find(
        (value) =>
          typeof value === "string" &&
          value.trim() !== "" &&
          !value.includes("undefined") &&
          !value.includes("null")
      ) ?? "";
    const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL;

    if (typeof redirectPath === "string" && redirectPath.trim() !== "") {
      if (/^https?:\/\//i.test(redirectPath)) {
        window.location.href = redirectPath;
        return;
      }

      const normalizedPath = redirectPath.startsWith("/")
        ? redirectPath
        : `/${redirectPath}`;

      // If API path already contains "/admin/...", navigate by origin to avoid
      // duplicating location segments from NEXT_PUBLIC_LEGACY_URL.
      if (normalizedPath.startsWith("/admin/")) {
        if (legacyBase) {
          try {
            const origin = new URL(legacyBase).origin;
            window.location.href = `${origin}${normalizedPath}`;
            return;
          } catch {
            window.location.href = normalizedPath;
            return;
          }
        }
        window.location.href = normalizedPath;
        return;
      }

      if (legacyBase) {
        const base = legacyBase.replace(/\/+$/, "");
        const path = normalizedPath.replace(/^\/+/, "");
        window.location.href = `${base}/${path}`;
        return;
      }

      window.location.href = normalizedPath;
      return;
    }

    toast.info("Invoice generated but redirect URL was not provided.");
  }, [details?.id, location]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUnscheduleSave = React.useCallback(async (reason: string) => {
    if (!onUnschedule) {
      toast.error("Unschedule function not available");
      return false;
    }
    return await onUnschedule(reason);
  }, [onUnschedule]);


  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const status = details?.status?.toLowerCase() || "";
    const isUnscheduled = status.includes("unscheduled");
    const isRescheduled = status.includes("rescheduled");

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

    const rows: SectionCardDataRow[] = [
      {
        label: "Teacher",
        value: teacherValue,
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

    if (isRescheduled) {
      rows.splice(1, 0,
        {
          label: "Original Date",
          value: details?.schedule.originalDate || "N/A",
        },
        {
          label: "Scheduled Date",
          value: details?.schedule.scheduledDate || "N/A",
        }
      );
    } else if (isUnscheduled) {
      rows.splice(1, 0, {
        label: "Original Date",
        value: details?.schedule.originalDate || "N/A",
      });
    } else {
      rows.splice(1, 0, {
        label: "Scheduled Date",
        value: details?.schedule.scheduledDate || "N/A",
      });
    }

    return rows;
  }, [details, handleTeacherClick]);

  return (
    <>
      <SectionCard
        title="Schedule"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={shouldShowHeaderActions ? (
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
              {shouldShowSecondaryActions && (
                <DropdownMenuItem onClick={handleUnscheduleClick}>
                  Unschedule Lesson
                </DropdownMenuItem>
              )}
              {shouldShowSecondaryActions && !hideGenerateInvoice && (
                <DropdownMenuItem onClick={handleGenerateInvoiceClick}>
                  Generate Invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined}
      />
      <UnscheduleReasonModal
        open={isUnscheduleModalOpen}
        onOpenChange={setIsUnscheduleModalOpen}
        location={location}
        onSave={handleUnscheduleSave}
      />
      <EditScheduleModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        location={location}
        details={details}
        onSuccess={onScheduleEdited}
      />
    </>
  );
});

