"use client";

import { useAppSelector } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { historyColumns } from "../../../../teacherTabConfigs";

interface HistoryTabProps {
  location: string;
  teacherId: number;
}

export function HistoryTab({ location, teacherId }: HistoryTabProps) {
  const data = useAppSelector((state) => state.teacherTabs.historyData);

  return (
    <TabContent
      title="History"
      data={data}
      columns={historyColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No history found."
    />
  );
}

