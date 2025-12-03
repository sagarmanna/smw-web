"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { unscheduledLessonColumns } from "../../../../teacherTabConfigs";

interface UnscheduledLessonTabProps {
  location: string;
  teacherId: number;
}

export function UnscheduledLessonTab({ location, teacherId }: UnscheduledLessonTabProps) {
  const data = useAppSelector((state) => state.teacherTabs.unscheduledLessonData);
  const [showAll, setShowAll] = useState<boolean>(false);

  return (
    <TabContent
      title="Unscheduled Lesson"
      data={data}
      columns={unscheduledLessonColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No unscheduled lessons found."
      showAllCheckbox={true}
      showAllChecked={showAll}
      onShowAllChange={setShowAll}
    />
  );
}

