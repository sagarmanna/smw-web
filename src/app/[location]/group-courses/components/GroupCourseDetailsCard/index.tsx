"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { CourseInfoResponse } from "../../[id]/groupCourseDetails.api";
import { formatCurrency } from "@/utils/formatCurrency";

interface GroupCourseDetailsCardProps {
  courseInfoData: CourseInfoResponse | null;
  isLoading?: boolean;
}

export const GroupCourseDetailsCard = React.memo(function GroupCourseDetailsCard({
  courseInfoData,
  isLoading = false,
}: GroupCourseDetailsCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    if (!courseInfoData || !courseInfoData.course) {
      return [
        { label: "Program", value: "N/A" },
        { label: "Teacher", value: "N/A" },
        { label: "Rate", value: "N/A" },
        { label: "Online", value: "N/A" },
      ];
    }

    const course = courseInfoData.course;

    return [
      {
        label: "Program",
        value: course.program || "N/A",
      },
      {
        label: "Teacher",
        value: course.teacher || "N/A",
      },
      {
        label: "Rate",
        value: course.rate || "N/A",
      },
      {
        label: "Online",
        value: course.online || "No",
      },
    ];
  }, [courseInfoData]);

  return (
    <SectionCard
      title="Details"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});

