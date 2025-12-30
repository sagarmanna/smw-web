"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { historyColumns } from "../../../../administratorTabConfigs";
import { fetchHistoryData } from "../../../../[id]/administratorTabs.slice";

interface HistoryTabProps {
  location: string;
  administratorId: number;
}

export function HistoryTab({ location, administratorId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.administratorTabs.historyData);
  const loading = useAppSelector((state) => state.administratorTabs.historyLoading);
  const error = useAppSelector((state) => state.administratorTabs.historyError);
  const historyAdministratorId = useAppSelector((state) => state.administratorTabs.historyAdministratorId);

  useEffect(() => {
    // Only fetch if we don't have data for this administrator yet
    if (historyAdministratorId !== administratorId) {
      dispatch(fetchHistoryData({ location, administratorId }));
    }
  }, [location, administratorId, dispatch, historyAdministratorId]);

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

