"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { CourseInfoResponse } from "../../[id]/groupCourseDetails.api";

interface GroupCourseScheduleCardProps {
  courseInfoData: CourseInfoResponse | null;
  isLoading?: boolean;
}

export const GroupCourseScheduleCard = React.memo(function GroupCourseScheduleCard({
  courseInfoData,
  isLoading = false,
}: GroupCourseScheduleCardProps) {
  const scheduleRows = React.useMemo<SectionCardDataRow[]>(() => {
    if (!courseInfoData || !courseInfoData.schedule) {
      return [
        { label: "Duration", value: "N/A" },
        { label: "Time", value: "N/A" },
        { label: "Period", value: "N/A" },
      ];
    }

    const schedule = courseInfoData.schedule;

    return [
      {
        label: "Duration",
        value: schedule.duration || "N/A",
      },
      {
        label: "Time",
        value: schedule.time || "N/A",
      },
      {
        label: "Period",
        value: schedule.period || "N/A",
      },
    ];
  }, [courseInfoData]);

  return (
    <SectionCard
      title="Schedule"
      data={scheduleRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});

