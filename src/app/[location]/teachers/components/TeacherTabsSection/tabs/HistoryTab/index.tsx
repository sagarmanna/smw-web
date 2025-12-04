"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { historyColumns } from "../../../../teacherTabConfigs";
import { fetchHistoryData } from "../../../../[id]/teacherTabs.slice";

interface HistoryTabProps {
  location: string;
  teacherId: number;
}

export function HistoryTab({ location, teacherId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.historyData);
  const loading = useAppSelector((state) => state.teacherTabs.historyLoading);
  const error = useAppSelector((state) => state.teacherTabs.historyError);
  const historyTeacherId = useAppSelector((state) => state.teacherTabs.historyTeacherId);

  useEffect(() => {
    // Only fetch if we don't have data for this teacher yet
    if (historyTeacherId !== teacherId) {
      dispatch(fetchHistoryData({ location, teacherId }));
    }
  }, [location, teacherId, dispatch, historyTeacherId]);

  return (
    <TabContent
      title="History"
      data={data}
      columns={historyColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No history found."
      loading={loading}
      error={error}
      enablePagination={false}
    />
  );
}
