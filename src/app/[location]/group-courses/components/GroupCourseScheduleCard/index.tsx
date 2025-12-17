"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { GroupCourseDetailsResponse } from "../../[id]/groupCourseDetails.api";
import { formatDisplayDate } from "@/utils/dateUtils";

interface GroupCourseScheduleCardProps {
  courseInfo: GroupCourseDetailsResponse | null;
  isLoading?: boolean;
}

export const GroupCourseScheduleCard = React.memo(function GroupCourseScheduleCard({
  courseInfo,
  isLoading = false,
}: GroupCourseScheduleCardProps) {
  const scheduleRows = React.useMemo<SectionCardDataRow[]>(() => {
    if (!courseInfo) {
      return [
        { label: "Duration", value: "N/A" },
        { label: "Time", value: "N/A" },
        { label: "Period", value: "N/A" },
      ];
    }

    const period = courseInfo.startDate && courseInfo.endDate
      ? `${formatDisplayDate(courseInfo.startDate)} to ${formatDisplayDate(courseInfo.endDate)}`
      : "N/A";

    return [
      {
        label: "Duration",
        value: courseInfo.duration || "N/A",
      },
      {
        label: "Time",
        value: courseInfo.fromTime || "N/A",
      },
      {
        label: "Period",
        value: period,
      },
    ];
  }, [courseInfo]);

  return (
    <SectionCard
      title="Schedule"
      data={scheduleRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});

