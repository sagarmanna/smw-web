"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { GroupCourseDetailsResponse } from "../../[id]/groupCourseDetails.api";
import { formatCurrency } from "@/utils/formatCurrency";

interface GroupCourseDetailsCardProps {
  courseInfo: GroupCourseDetailsResponse | null;
  isLoading?: boolean;
}

export const GroupCourseDetailsCard = React.memo(function GroupCourseDetailsCard({
  courseInfo,
  isLoading = false,
}: GroupCourseDetailsCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    if (!courseInfo) {
      return [
        { label: "Program", value: "N/A" },
        { label: "Teacher", value: "N/A" },
        { label: "Rate", value: "N/A" },
        { label: "Online", value: "N/A" },
      ];
    }

    return [
      {
        label: "Program",
        value: courseInfo.program || "N/A",
      },
      {
        label: "Teacher",
        value: courseInfo.teacher || "N/A",
      },
      {
        label: "Rate",
        value: formatCurrency(courseInfo.rate),
      },
      {
        label: "Online",
        value: courseInfo.isOnline ? "Yes" : "No",
      },
    ];
  }, [courseInfo]);

  return (
    <SectionCard
      title="Details"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});

